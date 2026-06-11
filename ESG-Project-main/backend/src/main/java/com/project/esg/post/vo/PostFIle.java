package com.project.esg.post.vo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.apache.ibatis.type.Alias;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Alias(value="postFile")
public class PostFIle {
    private long postFileId;
    private String fileName;
    private String filePath;
    private long postId;
}
