package com.corrigeaqui.dtos;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class MapMarkerDTO {
    private Long id;
    private Double lat;
    private Double lng;
    private String category;
    private String categoryColor;
    private String title;
    private String description;
    private String status;
    private List<String> images;
}
