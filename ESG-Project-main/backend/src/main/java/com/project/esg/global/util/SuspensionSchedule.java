package com.project.esg.global.util;

import com.project.esg.admin.dao.AdminDao;
import com.project.esg.admin.dto.SuspendDto;
import com.project.esg.admin.service.AdminService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Transactional
@Component
public class SuspensionSchedule {
    @Autowired
    private AdminDao dao;

    //회원 정지 풀어주는 스케줄러

    @Transactional
    @Scheduled(cron = "0 0 12 * * *")
    public void restoreStatus(){
        //endDate =< now()
        List<SuspendDto> list = dao.getSuspendedList();
        System.out.println(list);
        System.out.println("tlwkr");
        for(SuspendDto restorer : list){
            Integer userId=restorer.getTargetUserId();
//            restorer.getReportId();
            dao.restoreStatus(userId);
            System.out.println(userId + " 회원의 정지가 풀렸습니다.");
        }
    }
}
