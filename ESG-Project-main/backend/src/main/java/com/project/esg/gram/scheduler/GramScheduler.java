package com.project.esg.gram.scheduler;

import com.project.esg.gram.dao.GramDao;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class GramScheduler {

    @Autowired
    private GramDao gramDao;

    @Scheduled(fixedRate = 3600000) // 1시간마다 실행
    public void expireOldGrams() {
        gramDao.expireOldGrams();
    }
}