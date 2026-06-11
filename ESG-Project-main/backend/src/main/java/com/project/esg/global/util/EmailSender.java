package com.project.esg.global.util;

import jakarta.mail.internet.InternetAddress;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Component;

import java.io.UnsupportedEncodingException;
import java.util.Date;

@Component
public class EmailSender {
    @Autowired
    private JavaMailSender sender;

    public void sendMail(String emailTitle, String receiver, String emailContent) {
        MimeMessage message = sender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message);

        try {
            helper.setSentDate(new Date());
            helper.setFrom(new InternetAddress("masterbberry@gmail.com", "ESG"));
            helper.setTo(receiver);
            helper.setSubject(emailTitle);
            helper.setText(emailContent, true);
            sender.send(message);


        } catch (UnsupportedEncodingException e) {
            e.printStackTrace();
        } catch (MessagingException e) {
            System.out.println("메일 전송 실패:" + e.getMessage());
        }


    }

}
