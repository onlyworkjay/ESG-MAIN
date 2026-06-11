package com.project.esg.post.service;

import com.project.esg.global.util.CookieUtils;
import com.project.esg.global.util.FileUtils;
import com.project.esg.post.dao.PostDao;
import com.project.esg.post.dto.ListDto;
import com.project.esg.post.dto.PostResponse;
import com.project.esg.post.dto.ReportDto;
import com.project.esg.post.dto.SearchDto;
import com.project.esg.post.vo.Post;
import com.project.esg.users.vo.LoginUser;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
public class PostService {
    @Autowired
    private PostDao postDao;
    @Autowired
    private FileUtils fileUtil;
    @Autowired
    private CookieUtils cookieUtil;
    private int cookieTime = 60 * 5; // 쿠키 시간설정 5분

    /// 게시글 등록(한진호)
    public PostResponse<?> createPost(LoginUser user, Post post, List<MultipartFile> files) {
        //순서 1.게시물 DB 등록 2-1.파일업로드 2-2.파일DB등록 3.실패시 파일삭제
        /**  파일체크용
         if (files != null) {
         for (MultipartFile file : files) {
         System.out.println("\n파일명: " + file.getOriginalFilename());
         System.out.println("크기: " + file.getSize());
         System.out.println("타입: " + file.getContentType());
         }
         }
         */
        //토큰에서 아이디 추출해서 post 객체에 바인딩
        post.setUserId(user.getUserId());

        //공지사항 등록 권한 검증
        String userRole = user.getRole();
        boolean isAdmin = "admin".equals(userRole) || "master".equals(userRole);
        boolean isNotice = post.getIsNotice() == 1;
        if (isNotice && !isAdmin) {  //공지사항등록 요청이 왔으나 관리자가 아닐때
            throw new RuntimeException("공지글 작성 권한이 없습니다.");
        }


        //1.게시물 DB 등록
        int postResult = postDao.insertPost(post);
        if (postResult <= 0) {
            throw new RuntimeException("게시글 등록에 실패했습니다.");
        }
        Long postId = post.getPostId();

        //2-1. 파일업로드
        List<String> s3Keys = new ArrayList<>();
        int insertFile = 0;     //S3에 업로드한 파일 갯수
        int insertFileDb = 0;   //DB에 업로드한 파일 행수
        if (files != null && !files.isEmpty()) {
            String fileRepo = "posts/" + postId;    //업로드 경로설정
            try {
                for (MultipartFile file : files) {
                    if (!file.isEmpty()) {
                        insertFile++;
                        // 2-1. 원본 파일명 추출
                        String originalFileName = file.getOriginalFilename();

                        // 2-2. 파일유틸에서 업로드 메서드 호출하여 파일 업로드 후 s3Key 획득
                        String s3Key = fileUtil.uploadReviewImage(file, fileRepo);
                        s3Keys.add(s3Key);

                        // 3. 파일 DB에 등록
                        insertFileDb += postDao.insertPostFile(originalFileName, s3Key, postId);

                    }

                }
            } catch (Exception e) {
                for (String key : s3Keys) {
                    fileUtil.delete(key);
                }
                throw new RuntimeException("파일업로드 중 오류 발생");
            }

        }

        //3.검증 : S3 업로드 수 와 DB에 올라간 수가 맞지 않을때
        if (insertFile != insertFileDb) {
            //3-1 이미지 삭제하기
            for (String key : s3Keys) {
                fileUtil.delete(key);
            }
            throw new RuntimeException("일부 파일 정보가 DB에 정상적으로 등록되지 않았습니다.");
        }
        return new PostResponse<>(true, "게시물등록완료", postId);
    }

    /// 게시글 상세 보기(한진호)
    public PostResponse<Post> getPost(long postId, LoginUser user, HttpServletRequest request, HttpServletResponse response) {
        //1.posts DB 조회 (존재하지 않는 게시글 처리)
        //2.권한 검증 및 조건 분기
        //3.조회수 증가 로직 실행
        //4.post_files DB 조회 (해당 게시글에 종속된 S3 키 목록 가져오기)
        //5.데이터 가공 (S3 URL 변환 및 DTO 조립) FileUtils.getFileUrl(s3Key) list<string>

        //1.posts 테이블에서 DB 조회
        Post post = postDao.getPostById(postId);
        if (post == null) {
            return new PostResponse<>(false, "존재하지 않는 게시글입니다.");
        }
        //2.권한 검증 및 조건 분기
        String postStatus = post.getStatus();
        Long userId = 0L;               //비회원(db에 존재하지 않음)
        String userRole = "notUser";    //비회원(db에 존재하지 않음)
        boolean isLike = false;         //초기값 false 셋팅
        boolean isReport = false;       //초기값 false 셋팅
        if (user != null) {
            userRole = user.getRole();
            userId = user.getUserId();
            //추가작업(좋아요/신고 여부 조회)
            Map<String, Object> params = postDao.getStatus(postId, userId);
            params.get("is_like");
            params.get("is_report");
            isLike = "1".equals(String.valueOf(params.get("is_like")));
            isReport = "1".equals(String.valueOf(params.get("is_report")));


        }
        boolean isAdmin = "admin".equals(userRole) || "master".equals(userRole);
        boolean isHidden = postStatus.equals("hidden");
        boolean isDeleted = postStatus.equals("deleted");

        //관리자 아닌경우 hidden/deleted 접근불가
        if (!isAdmin) {
            if (isHidden || isDeleted) {
                return new PostResponse<>(false, "요청권한이 없습니다.");
            }
        } else { //관리자의 경우 본문앞에 상태를 명시
            /** 파기
             switch (post.getStatus()) {
             case "hidden":
             post.setContent("(관리자가 숨김처리한 게시글입니다)" + post.getContent());
             break;
             case "deleted":
             post.setContent("(사용자가 삭제한 게시글입니다)" + post.getContent());
             break;
             }
             */

        }
        //3.조회수 증가 로직(요청자 == 작성자이거나 관리자의 경우 조회수증가X)

        boolean alreadyViewed = cookieUtil.alreadyViewed(request, postId);//쿠키 조회
        boolean isSkipViewCount = isAdmin || (userId != 0L && userId.equals(post.getUserId()));
        if (!isSkipViewCount) {
            if (!alreadyViewed) {
                //System.out.println("조회수증가");
                postDao.incrementViewCount(postId);//조회수증가
                post.setViewCount(post.getViewCount() + 1);//조회수보정
                cookieUtil.createCookie(response, postId, cookieTime);//쿠키생성
            }
        }

        //4.post_files 테이블에서 s3key 조회
        List<String> s3keys = postDao.getS3KeysByPostId(postId);

        //5.s3key존재할때 fileUtil.getFileUrl(s3key)을 통해 ImageUrl 가져와 post 객체에 바인딩
        List<String> imageUrls = new ArrayList<>();
        if (!s3keys.isEmpty()) {
            for (String key : s3keys) {
                imageUrls.add(fileUtil.getFileUrl(key));
            }
            post.setS3keys(imageUrls);
        } else {
            //System.out.println("해당 postId 에 연결된 파일이 없어요\n");
        }
        //System.out.println("게시물 전달준비완료");
        return new PostResponse<>(true, "조회성공", post, isLike, isReport);
    }

    /// 게시글 수정(한진호)
    public PostResponse<?> updatePost(LoginUser user, Post post, List<MultipartFile> files, List<String> deleteS3Keys, long postId) {
        //순서 : 1. 요청자 검증 2. 기존파일삭제 3. 새파일 업로드 4.검증 5.게시글수정
        //1. 요청자 검증
        Post originalPost = postDao.getPostById(postId);    //재사용
        if (originalPost == null) {
            return new PostResponse<>(false, "존재하지 않는 게시글입니다.");
        }
        boolean isWriter = originalPost.getUserId().equals(user.getUserId());   //요청자 == 원본글 작성자
        if (!isWriter) {
            return new PostResponse<>(false, "해당 게시글을 수정할 권한이 없습니다.");
        }
        post.setUserId(user.getUserId());
        //공지사항 요청시 관리자 검증
        String userRole = user.getRole();
        boolean isNotice = post.getIsNotice() == 1;
        boolean isAdmin = "admin".equals(userRole) || "master".equals(userRole);

                if (isNotice && !isAdmin) {  //공지사항등록 요청이 왔으나 관리자가 아닐때
            throw new RuntimeException("공지글 수정 권한이 없습니다.");
        }
        //2. 기존파일 삭제
        int deleteFile = 0;
        int deleteFileDb = 0;
        if (deleteS3Keys != null && !deleteS3Keys.isEmpty()) {
            for (String s3key : deleteS3Keys) {
                fileUtil.delete(s3key);
                deleteFile++;
                deleteFileDb += postDao.deletePostFile(s3key, postId);
            }
            if (deleteFile != deleteFileDb) {
                //예외처리
                throw new RuntimeException("기존파일 삭제중 오류 발생");
            }
        }

        //3. 새파일 업로드
        int insertFile = 0;     //s3에 업로드한 파일 갯수
        int insertFileDb = 0;   //DB에 업로드한 파일 행수
        List<String> s3Keys = new ArrayList<>();
        if (files != null && !files.isEmpty()) {
            String fileRepo = "posts/" + postId;    //업로드 경로설정
            try {
                for (MultipartFile file : files) {
                    if (!file.isEmpty()) {
                        insertFile++;
                        // 2-1. 원본 파일명 추출
                        String originalFileName = file.getOriginalFilename();

                        // 2-2. 파일유틸에서 업로드 메서드 호출하여 파일 업로드 후 s3Key 획득
                        String s3Key = fileUtil.uploadReviewImage(file, fileRepo);
                        s3Keys.add(s3Key);

                        // 3. 파일 DB에 등록
                        insertFileDb += postDao.insertPostFile(originalFileName, s3Key, postId);

                    }

                }
            } catch (Exception e) {
                for (String key : s3Keys) {
                    fileUtil.delete(key);
                }
                throw new RuntimeException("파일업로드 중 오류 발생");
            }
        }
        //4.검증 : S3 업로드 수 와 DB에 올라간 수가 맞지 않을때
        if (insertFile != insertFileDb) {
            //4-1 이미지 삭제하기
            for (String key : s3Keys) {
                fileUtil.delete(key);
            }
            throw new RuntimeException("일부 파일 정보가 DB에 정상적으로 등록되지 않았습니다.");
        }

        //5.게시글수정
        post.setPostId(postId); // postId 바인딩, where절에 postId를 검증 및 안전하게 사용하기 위해

        int result = postDao.updatePost(post);

        if (result <= 0) {
            throw new RuntimeException("게시글 본문 수정에 실패했습니다.");
        }

        return new PostResponse<>(true, "게시물 수정 완료", postId);
    }

    /// 게시글 삭제(한진호)
    public PostResponse<?> deletePost(LoginUser user, long postId) {
        //순서 1.요청자 검증 2.삭제할 S3key 목록 확보 3.파일DB삭제 4.게시물DB삭제 5.S3 파일삭제
        //1. 요청자검증
        Post originalPost = postDao.getPostById(postId);
        if (originalPost == null) {
            return new PostResponse<>(false, "존재하지 않는 게시글입니다.");
        }
        boolean isWriter = originalPost.getUserId().equals(user.getUserId());
        if (!isWriter) {
            return new PostResponse<>(false, "해당 게시글을 삭제할 권한이 없습니다.");
        }
        //2.삭제할 S3key 목록 확보
        List<String> s3keys = postDao.getS3KeysByPostId(postId);    //재사용
        //3.파일 DB 삭제
        int deleteFileDb = 0;
        if (s3keys != null && !s3keys.isEmpty()) {
            for (String s3key : s3keys) {
                deleteFileDb += postDao.deletePostFile(s3key, postId);     //재사용
            }
            if (deleteFileDb != s3keys.size()) {
                //삭제할 파일수와 파일 DB 삭제 결과가 다를 경우 예외처리
                throw new RuntimeException("파일DB삭제 중 오류 발생");
            }
        }
        //4. 게시물삭제
        int deletePostDb = postDao.deletePost(postId);
        if (deletePostDb <= 0) {
            throw new RuntimeException("게시글파일 삭제중 오류발생");
        }
        //5. S3 파일삭제 deletePostDb == 1
        if (s3keys != null && !s3keys.isEmpty()) {
            for (String s3key : s3keys) {
                fileUtil.delete(s3key);
            }
        }
        return new PostResponse<>(true, "게시물 삭제 성공");
    }

    /// 게시글 좋아요 (한진호)
    public PostResponse<?> insertLike(LoginUser user, long postId) {
        Post post = postDao.getPostById(postId);        //재사용
        if (post == null) {
            return new PostResponse<>(false, "존재하지 않는 게시글입니다.");
        }
        long userId = user.getUserId();
        int likeResult = postDao.insertLike(userId, postId);
        if (likeResult <= 0) {
            throw new RuntimeException("좋아요 등록중 오류발생");
        }

        return new PostResponse<>(true, "좋아요 완료");
    }

    /// 게시글 좋아요 취소하기 (한진호)
    public PostResponse<?> deleteLike(LoginUser user, long postId) {
        //순서 1.post 조회 및 체크 2.좋아요 생성 및 응답반환
        Post post = postDao.getPostById(postId);        //재사용
        if (post == null) {
            return new PostResponse<>(false, "존재하지 않는 게시글입니다.");
        }
        long userId = user.getUserId();
        int likeResult = postDao.deleteLike(userId, postId);
        if (likeResult <= 0) {
            throw new RuntimeException("좋아요 취소중 오류발생");
        }

        return new PostResponse<>(true, "좋아요 취소 완료");
    }

    /// 게시글 신고하기 (한진호)
    public PostResponse<?> insertReport(LoginUser user, long postId, ReportDto report) {
        //순서 1. post 조회 및 체크 2.신고 생성 및 응답반환
        Post post = postDao.getPostById(postId);        //재사용
        if (post == null) {
            return new PostResponse<>(false, "존재하지 않는 게시글입니다.");
        }
        //postId 바인딩
        report.setPostId(postId);
        //userId 바인딩
        report.setUserId(user.getUserId());

        int reportResult = postDao.insertReport(report);
        if (reportResult <= 0) {
            throw new RuntimeException("신고 등록중 오류발생");
        }

        return new PostResponse<>(true, "좋아요 취소 완료");
    }

    /// 게시글 신고 조회하기 (한진호)
    public PostResponse<?> getReport(LoginUser user, Long postId) {
        Post post = postDao.getPostById(postId);        //재사용
        if (post == null) {
            return new PostResponse<>(false, "존재하지 않는 게시글입니다.");
        }
        ReportDto paramDto = new ReportDto(postId, user.getUserId());
        ReportDto reportDetail = postDao.getReport(paramDto);

        if (reportDetail == null) {     //신고내역이 없는 경우
            return new PostResponse<>(true, "신고하지 않은 글입니다.", null);
        }
        return new PostResponse<>(true, "신고내역 조회 성공", reportDetail);
    }

    /// 게시글 신고 취소하기 (한진호)
    public PostResponse<?> deleteReport(LoginUser user, Long postId) {
        //순서 1. post 조회 및 체크 2. 신고 여부조회 및 상태체크 3.신고 취소 및 응답반환
        //1. post 조회 및 체크
        Post post = postDao.getPostById(postId);        //재사용
        if (post == null) {
            return new PostResponse<>(false, "존재하지 않는 게시글입니다.");
        }

        //2. 신고 여부조회 및 상태체크 (동시성)
        ReportDto paramDto = new ReportDto(postId, user.getUserId());    //신고 조회를 위해 보낼 값
        ReportDto report = postDao.getReport(paramDto);                  //신고 상태를 조회한 값

        if (report == null) {
            return new PostResponse<>(false, "신고정보를 확인할수 없습니다.");
        }
        String status = report.getStatus();
        int reportResult = 0;
        if ("pending".equals(status)) {
            //접수중일때 신고하기 삭제
            reportResult = postDao.deleteReport(report);
        } else { //접수중이 아닐때
            return new PostResponse<>(false, "관리자가 이미 처리하여 취소가 불가능합니다.");
        }
        if (reportResult <= 0) {
            return new PostResponse<>(false, "신고 취소 처리 중 알 수 없는 오류가 발생했습니다.");
        }
        return new PostResponse<>(true, "신고 취소 완료.");
    }

    /// 게시글 목록 보기(한진호)
    public ListDto getPostList(SearchDto params) {
        //1. 총게시물수 구하기
        Long totalCount = postDao.getPostCount(params);

        //2. 총페이지수 구하기 page/size +1
        Long totalPage = (long) Math.ceil(totalCount / (double) params.getNaviSize());

        //3. 공지사항 가져오기
        List<Post> noticeList = postDao.getPostNoticeList(params);
        //4. 리스트
        List<Post> list = postDao.getPostList(params);

        ListDto listDto = new ListDto(list, noticeList, totalPage); //생성자를 통해 빈 객체라도 보낸다.
        return listDto;
    }


}