package com.project.esg.global.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;

//이 설정은  Spring Boot 서버가 AWS S3에 접속할 수 있도록 s3Client를 만드는 코드

//객체를 등록해주는(spring container(객체 관리 공간)에 Bean(객체 단위)로 올라감) 어노테이션(@Autowired 쓸 수 있게 됨)
//@Component 는 적혀있는 자신이 객체로 올라가지만,@Configuration은 (정확히는 @Component의 변형 버전) @Bean어노테이션이 붙은 메소드들의 return을 객체로 등록한다.

@Configuration
public class S3Config {
    //@Value -> application.properties,혹은 application.yaml같은 파일 읽어서 값 가져옴
    @Value("${cloud.aws.credentials.access-key}")
    private String accessKey;//말그대로 s3들어가기위한 access-key

    @Value("${cloud.aws.credentials.secret-key}")
    private String secretKey;//말그대로 s3들어가기위한 secret-key

    @Value("${cloud.aws.region.static}")
    private String region;//지역 설정 (현재는 ap-northeast-2로 되어있음(서울))

    @Bean   //이 메서드의 리턴이 객체로 등록
    public S3Client s3Client() {//S3Client는 Java 코드에서 AWS S3와 통신하게 해주는 객체
        return S3Client.builder()
                .region(Region.of(region))//Region -> 아마존 지역(리전) 지정
                .credentialsProvider(//정보 등록
                        StaticCredentialsProvider.create(//AwsBasicCredentials를 S3Client에게 전달하는 역할
                                AwsBasicCredentials.create(accessKey, secretKey)//aws에 로그인할 때 필요한 인증 정보를 담는 객체
                        )
                )
                .build();
    }


}
