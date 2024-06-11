package com.koozka.model;

import lombok.Data;

@Data
public class GameMove {
    private int fromRow;
    private int fromCol;
    private int toRow;
    private int toCol;
}
