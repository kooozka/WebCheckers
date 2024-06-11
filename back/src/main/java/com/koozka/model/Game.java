package com.koozka.model;

import jakarta.persistence.*;
import lombok.Data;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@Data
@Entity
public class Game {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne
    private Player player1;
    @ManyToOne
    private Player player2;
    @Enumerated(EnumType.STRING)
    private GameStatus status;
    @ElementCollection(fetch = FetchType.EAGER)
    private List<String> board;
    private String currentTurn;
    private String winner;

    public String[][] getBoardAsArray() {
        String[][] boardArray = new String[8][8];
        for (int i = 0; i < board.size(); i++) {
            boardArray[i / 8][i % 8] = board.get(i);
        }
        return boardArray;
    }

    public void setBoardFromArray(String[][] boardArray) {
        board = new ArrayList<>();
        for (final String[] strings : boardArray) {
            Collections.addAll(board, strings);
        }
    }
}
