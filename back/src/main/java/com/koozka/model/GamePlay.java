package com.koozka.model;

import lombok.Data;

@Data
public class GamePlay {
    private String color;
    private GameMove gameMove;
    private Long gameId;
    private int deleteRow;
    private int deleteCol;
}
