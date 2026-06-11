package com.project.esg.global.util;


import net.coobird.thumbnailator.Thumbnails;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
//@Slf4j  -> 로그 객체(Logger)를 자동으로 만들어주는 Lombok 어노테이션
//로그 객체는 쉽게 말하면 기본sysout기능에 여러 기능을 추가한 객체()

//@RequiredArgsConstructor -> Lombok이 반드시 초기화해야 하는 필드만 받는 생성자를 만들어 주는 어노테이션입니다.아래가 예시

//    private final S3Client s3Client;      이처럼 final이거나 @NotNull이 붙여 씀(생성자 주입)

//헷갈릴시에 @Autowired로 가져와도 동작은 한다(필드 주입).다만, 실무기준 @RAC(생성자 주입)를 쓴다.
@RequiredArgsConstructor
@Component
public class FileUtils {
    // 메뉴 사진은 음식/상품 이미지라 화면에서 크게 보여질 수 있으므로 1200px, 품질 0.8 정도로 유지한다.
    private static final long MENU_IMAGE_MAX_SIZE = 5 * 1024 * 1024;//이거(5megabyte)보다 큰 파일 처리안함
    private static final int MENU_IMAGE_MAX_WIDTH = 1000;
    private static final int MENU_IMAGE_MAX_HEIGHT = 1000;
    private static final double MENU_IMAGE_QUALITY = 0.8;

    // 후기 사진은 최대 3장까지 올라갈 수 있으므로 메뉴 사진보다 살짝 더 작게 압축한다.
    //이거 지혁씨건데, 제가 확인은 해보지 못했습니다.
    private static final long REVIEW_IMAGE_MAX_SIZE = 5 * 1024 * 1024;
    private static final int REVIEW_IMAGE_MAX_WIDTH = 1000;
    private static final int REVIEW_IMAGE_MAX_HEIGHT = 1000;
    private static final double REVIEW_IMAGE_QUALITY = 0.75;
    private static final int REVIEW_IMAGE_MAX_COUNT = 3;

    // S3Config.java에서 만든 S3Client Bean 주입
    private final S3Client s3Client;

    // application.yml의 cloud.aws.s3.bucket 값을 읽어옴
    @Value("${cloud.aws.s3.bucket}")
    private String bucket;

    // application.yml의 cloud.aws.region.static 값을 읽어옴
    @Value("${cloud.aws.region.static}")
    private String region;

    /**
     * [핵심] S3에 파일 업로드
     * MultipartFile(브라우저에서 받은 파일)을 S3 버킷에 저장
     * @return s3Key - S3에 저장된 경로+파일명 (DB에 저장할 값)
     * String fileRepo 부분은 아래 upload의 2번 부분 참조
     */
//    public String upload(MultipartFile file, String fileRepo) throws IOException {
//
//        // 1. 원본 파일명에서 확장자 추출 (예: ".jpg", ".pdf")
//        String originalName = file.getOriginalFilename();
//        String ext = originalName != null && originalName.contains(".")
//                ? originalName.substring(originalName.lastIndexOf("."))
//                : "";
//
//        // 2. 파일명 충돌 방지 → UUID로 고유한 파일명 생성
//        //    저장 경로 예시: posts/3/550e8400-e29b-41d4-a716.jpg
//        /*  여기서부터 민지원 작성, 고유한 파일명을 위해서 fileRepo 부분에 들어와야할 정보는
//        /  각각의 컨트롤러에 url요청 + "/" + 브랜드는 브랜드식별자,
//                                         후기는 후기 번호,
//                                         썸네일은 회원식별값
//                                         아니면 아예 UUID.randomUUID를 이용한 고유값,예를 들어
//                                         String groupId = UUID.randomUUID() ->UUID.randomUUID는 원래 36자의 하이폰 포함 문자열 뽑음
//                                                        .toString()//String 변환(현재는 타입이 UUID 타입임)
//                                                        .replace("-", "")//(하이폰 제거)
//                                                        .substring(0, 12);//(12자로 제한(굳이 할 필요는 없음))
//        */
//        String s3Key = fileRepo + "/" + UUID.randomUUID() + ext;
//
//        // 3. S3에 업로드할 요청 객체 생성
//        //    bucket: 어느 버킷에, key: 어떤 경로/이름으로 저장할지
//        PutObjectRequest putRequest = PutObjectRequest.builder()
//                .bucket(bucket)
//                .key(s3Key)
//                .contentType(file.getContentType())  // 파일 MIME 타입 (image/jpeg 등)
//                .contentLength(file.getSize())        // 파일 크기 (bytes)
//                .build();
//
//        // 4. 실제 S3 업로드 실행
//        s3Client.putObject(putRequest,
//                RequestBody.fromInputStream(file.getInputStream(), file.getSize()));
//
////        log.info("S3 업로드 완료: {}", s3Key);
//
//        // 5. 저장된 s3Key 반환 → PostService에서 DB에 저장
//        return s3Key;
//    }

    /**
     * 메뉴 사진 업로드용 메서드.
     *
     * 기존 upload()는 원본 파일을 그대로 S3에 올린다.
     * 이 메서드는 메뉴 사진을 서버에서 JPG로 압축한 뒤 S3에 올린다.
     *
     * 저장 결과는 항상 .jpg / image/jpeg 이다.
     */
    public String uploadMenuImage(MultipartFile file, String fileRepo) throws IOException {
        return uploadCompressedJpg(
                file,
                fileRepo,
                MENU_IMAGE_MAX_SIZE,
                MENU_IMAGE_MAX_WIDTH,
                MENU_IMAGE_MAX_HEIGHT,
                MENU_IMAGE_QUALITY
        );
    }

    /**
     * 후기 사진 1장 업로드용 메서드.
     *
     * 후기 사진은 여러 장 업로드될 수 있으므로
     * 한 장당 최대 크기와 압축 품질을 여기서 통일한다.
     */
    public String uploadReviewImage(MultipartFile file, String fileRepo) throws IOException {
        return uploadCompressedJpg(
                file,
                fileRepo,
                REVIEW_IMAGE_MAX_SIZE,
                REVIEW_IMAGE_MAX_WIDTH,
                REVIEW_IMAGE_MAX_HEIGHT,
                REVIEW_IMAGE_QUALITY
        );
    }

    /**
     * 후기 사진 여러 장 업로드용 메서드.
     *
     * "후기 사진은 최대 3장" 같은 개수 제한은 파일 1개를 처리하는 압축 로직보다
     * 여러 파일을 받는 이 메서드에서 검사하는 편이 자연스럽다.
     */
    public List<String> uploadReviewImages(List<MultipartFile> files, String fileRepo) throws IOException {
        if (files == null || files.isEmpty()) {
            throw new IllegalArgumentException("후기 사진을 선택해주세요.");
        }

        if (files.size() > REVIEW_IMAGE_MAX_COUNT) {
            throw new IllegalArgumentException("후기 사진은 최대 3장까지 업로드할 수 있습니다.");
        }

        List<String> s3Keys = new ArrayList<>();

        for (MultipartFile file : files) {
            s3Keys.add(uploadReviewImage(file, fileRepo));
        }

        return s3Keys;
    }

    /**
     * 이미지 파일을 검증하고, Thumbnailator로 JPG 압축한 뒤 S3에 업로드한다.
     *
     * MultipartFile -> BufferedImage -> byte[] -> S3 업로드 순서로 진행된다.
     * 압축 후에는 원본 파일 크기(file.getSize())가 아니라 compressedBytes.length를 contentLength로 넣어야 한다.
     */
    private String uploadCompressedJpg(
            MultipartFile file,
            String fileRepo,
            long maxSize,
            int maxWidth,
            int maxHeight,
            double quality
    ) throws IOException {
        validateImageFile(file, maxSize);

        byte[] compressedBytes = compressToJpg(file, maxWidth, maxHeight, quality);
        String s3Key = normalizeFileRepo(fileRepo) + "/" + UUID.randomUUID() + ".jpg";
                       //파일에 / 부분 처리해줌(이게 많을 경우)
        PutObjectRequest putRequest = PutObjectRequest.builder()
                .bucket(bucket)
                .key(s3Key)
                .contentType("image/jpeg")
                .contentLength((long) compressedBytes.length)
                .build();

        s3Client.putObject(putRequest, RequestBody.fromBytes(compressedBytes));

        return s3Key;
    }

    /**
     * 업로드된 파일이 서버에서 처리할 수 있는 이미지인지 확인한다.
     *
     * file.getContentType()은 브라우저가 보내는 값이라 100% 신뢰할 수는 없지만,
     * 1차 필터로는 충분히 유용하다.
     * 최종적으로는 ImageIO.read()가 실제 이미지로 읽을 수 있는지도 다시 확인한다.
     */
    private void validateImageFile(MultipartFile file, long maxSize) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("파일이 비어 있습니다.");
        }

        if (file.getSize() > maxSize) {
            throw new IllegalArgumentException("파일 용량이 너무 큽니다.");
        }

        String contentType = file.getContentType();

        if (!"image/jpeg".equals(contentType) && !"image/png".equals(contentType)) {
            throw new IllegalArgumentException("JPG, PNG 이미지만 업로드할 수 있습니다.");
        }
    }

    /**
     * MultipartFile을 Java 이미지 객체(BufferedImage)로 읽은 뒤 JPG byte[]로 압축한다.
     *
     * BufferedImage는 Java 메모리 안에서 이미지 픽셀 정보를 들고 있는 객체이다.
     * Thumbnailator는 이 BufferedImage를 받아서 크기 조절과 품질 압축을 처리한다.
     */
    private byte[] compressToJpg(
            MultipartFile file,
            int maxWidth,
            int maxHeight,
            double quality
    ) throws IOException {
        BufferedImage originalImage = ImageIO.read(file.getInputStream());
        //파일을 이미지 객체로 변환
        if (originalImage == null) {//txt등의 파일이 들어오면 안됨,그거 거르는 로직
            throw new IllegalArgumentException("이미지 파일만 업로드할 수 있습니다.");
        }

        // PNG 투명 배경 → 흰색으로 채우기
        BufferedImage rgbImage = new BufferedImage(
                originalImage.getWidth(),
                originalImage.getHeight(),
                BufferedImage.TYPE_INT_RGB
        );
        rgbImage.createGraphics().drawImage(originalImage, 0, 0, java.awt.Color.WHITE, null);

        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();//RAM에 임시 저장

        Thumbnails.of(rgbImage)
                .size(maxWidth, maxHeight)//수정(maxWidth)
                .outputQuality(quality)
                .outputFormat("jpg")
                .toOutputStream(outputStream);

        return outputStream.toByteArray();//바이트로 변환
    }

    /**
     * fileRepo 앞뒤의 슬래시를 정리한다.
     *
     * 예를 들어 "/menus/10/"이 들어오면 "menus/10"으로 바꿔서
     * S3 key가 "//"처럼 지저분해지는 것을 막는다.
     */
    private String normalizeFileRepo(String fileRepo) {
        if (fileRepo == null || fileRepo.trim().isEmpty()) {
            return "images";
        }

        return fileRepo.trim()
                .replaceAll("^/+", "")
                .replaceAll("/+$", "");
    }

    /**
     * S3에서 파일 삭제
     * 게시글 삭제/수정 시 기존 파일을 S3에서도 제거
     * @param s3Key 삭제할 파일의 S3 경로+파일명
     */
    public void delete(String s3Key) {
        try {
            DeleteObjectRequest deleteRequest = DeleteObjectRequest.builder()
                    .bucket(bucket)
                    .key(s3Key)  // 삭제할 파일 경로
                    .build();
            s3Client.deleteObject(deleteRequest);
//            log.info("S3 삭제 완료: {}", s3Key);
        } catch (Exception e) {
//            log.error("S3 삭제 실패: {}", s3Key, e);
        }
    }

    /**
     * S3 삭제 실패 시 예외를 던지는 삭제 메서드.
     * 첨부파일 개별 삭제처럼 DB 삭제와 강결합된 흐름에서 사용한다.
     */
    public void deleteOrThrow(String s3Key) {
        try {
            DeleteObjectRequest deleteRequest = DeleteObjectRequest.builder()
                    .bucket(bucket)
                    .key(s3Key)
                    .build();
            s3Client.deleteObject(deleteRequest);
//            log.info("S3 삭제 완료: {}", s3Key);
        } catch (Exception e) {
//            log.error("S3 삭제 실패: {}", s3Key, e);
            throw new RuntimeException("S3 파일 삭제에 실패했습니다.");
        }
    }

    /**
     * S3 key → 브라우저에서 접근 가능한 URL로 변환 -> 처음에 파일 집어넣을때 남긴 저장경로를 다시 URL로 만듬
     * 예: posts/3/uuid.jpg
     *  → https://my-bucket.s3.ap-northeast-2.amazonaws.com/posts/3/uuid.jpg
     */
    public String getFileUrl(String s3Key) {
        return "https://" + bucket + ".s3." + region + ".amazonaws.com/" + s3Key;
    }
    public String extractS3Key( String url) {
        String prefix = "https://" + bucket + ".s3." + region + ".amazonaws.com/";
        return url.replace(prefix, "");
    }
    public List<String> resize(String width, String height){

        return null;
    }
}
