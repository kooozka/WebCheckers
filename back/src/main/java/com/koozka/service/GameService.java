package com.koozka.service;

import com.koozka.exception.InvalidGameException;
import com.koozka.exception.NotFoundException;
import com.koozka.model.*;
import com.koozka.repository.GameRepository;
import com.koozka.repository.PlayerRepository;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
@AllArgsConstructor
@Slf4j
public class GameService {
    private final GameRepository gameRepository;
    private final PlayerRepository playerRepository;

    public Game createGame(String login) {
        Player player = createAndSavePlayer(login);
        Game game = initializeNewGame(player);
        gameRepository.save(game);
        return game;
    }

    public Game connectToRandomGame(String login) throws NotFoundException {
        Game game = findRandomNewGame().orElseThrow(() -> new NotFoundException("Game not found"));
        Player player = createAndSavePlayer(login);
        updateGameWithSecondPlayer(game, player);
        gameRepository.save(game);
        return game;
    }

    public Game gamePlay(GamePlay gamePlay) throws InvalidGameException, NotFoundException {
        Game game = findGameById(gamePlay.getGameId());
        validateGameStatus(game);
        updateGameBoard(game, gamePlay);
        checkAndSetWinner(game);
        switchTurnIfNecessary(game, gamePlay);
        gameRepository.save(game);
        return game;
    }

    private Player createAndSavePlayer(String login) {
        Player player = new Player();
        player.setLogin(login);
        playerRepository.save(player);
        return player;
    }

    private Game initializeNewGame(Player player) {
        Game game = new Game();
        game.setBoardFromArray(generateBoard());
        game.setPlayer1(player);
        game.setStatus(GameStatus.NEW);
        game.setCurrentTurn("W");
        return game;
    }

    private Optional<Game> findRandomNewGame() {
        return gameRepository.findAll().stream()
                .filter(g -> g.getStatus().equals(GameStatus.NEW))
                .findFirst();
    }

    private void updateGameWithSecondPlayer(Game game, Player player) {
        game.setPlayer2(player);
        game.setStatus(GameStatus.IN_PROGRESS);
        log.info(game.toString());
    }

    private Game findGameById(Long gameId) throws NotFoundException {
        return gameRepository.findById(gameId)
                .orElseThrow(() -> new NotFoundException("Game not found"));
    }

    private void validateGameStatus(Game game) throws InvalidGameException {
        if (game.getStatus().equals(GameStatus.FINISHED)) {
            throw new InvalidGameException("Game is already finished!");
        }
    }

    private void updateGameBoard(Game game, GamePlay gamePlay) {
        String[][] board = game.getBoardAsArray();
        updateBoardWithMove(board, gamePlay);
        game.setBoardFromArray(board);
    }

    private void updateBoardWithMove(String[][] board, GamePlay gamePlay) {
        String piece = board[gamePlay.getGameMove().getFromRow()][gamePlay.getGameMove().getFromCol()];
        boolean isKingMove = (gamePlay.getColor().equals("W") && gamePlay.getGameMove().getToRow() == 0)
                || (gamePlay.getColor().equals("B") && gamePlay.getGameMove().getToRow() == 7)
                || piece.length() > 1;
        board[gamePlay.getGameMove().getToRow()][gamePlay.getGameMove().getToCol()] = isKingMove ? gamePlay.getColor() + "K" : gamePlay.getColor();
        board[gamePlay.getGameMove().getFromRow()][gamePlay.getGameMove().getFromCol()] = "N";
        board[gamePlay.getDeleteRow()][gamePlay.getDeleteCol()] = "N";
    }

    private void checkAndSetWinner(Game game) {
        String winner = checkWin(game.getBoardAsArray());
        if (winner != null) {
            game.setWinner(winner);
            game.setStatus(GameStatus.FINISHED);
        }
    }

    private void switchTurnIfNecessary(Game game, GamePlay gamePlay) {
        if (!isTakePossible(game.getBoardAsArray(), gamePlay.getGameMove())) {
            game.setCurrentTurn(game.getCurrentTurn().equals("W") ? "B" : "W");
        }
    }

    private String[][] generateBoard() {
        String[][] board = new String[8][8];
        for (int row = 0; row < 8; row++) {
            for (int col = 0; col < 8; col++) {
                board[row][col] = determineInitialPiece(row, col);
            }
        }
        return board;
    }

    private String determineInitialPiece(int row, int col) {
        if ((row + col) % 2 == 1) {
            if (row < 3) {
                return "B";
            } else if (row > 4) {
                return "W";
            }
        }
        return "N";
    }

    private boolean isTakePossible(String[][] board, GameMove gameMove) {
        if (Math.abs(gameMove.getToRow() - gameMove.getFromRow()) > 1 || Math.abs(gameMove.getToCol() - gameMove.getFromCol()) > 1) {
            String piece = board[gameMove.getToRow()][gameMove.getToCol()];
            return checkPossibleTakes(board, piece, gameMove.getToRow(), gameMove.getToCol());
        }
        return false;
    }

    private boolean checkPossibleTakes(String[][] board, String piece, int row, int col) {
        List<int[]> directions = getDirections(piece);
        String enemyPiece = piece.startsWith("W") ? "B" : "W";
        String enemyKing = enemyPiece + "K";

        for (int[] direction : directions) {
            int enemyRow = row + direction[0];
            int enemyCol = col + direction[1];
            int jumpRow = row + 2 * direction[0];
            int jumpCol = col + 2 * direction[1];

            if (isValidPosition(enemyRow, enemyCol) && isValidPosition(jumpRow, jumpCol)) {
                if ((board[enemyRow][enemyCol].equals(enemyPiece) || board[enemyRow][enemyCol].equals(enemyKing))
                        && board[jumpRow][jumpCol].equals("N")) {
                    return true;
                }
            }
        }
        return false;
    }

    private boolean isValidPosition(int row, int col) {
        return row >= 0 && row < 8 && col >= 0 && col < 8;
    }

    private List<int[]> getDirections(String piece) {
        if (piece.equals("W")) {
            return Arrays.asList(new int[][]{{-1, -1}, {-1, 1}});
        } else if (piece.equals("B")) {
            return Arrays.asList(new int[][]{{1, -1}, {1, 1}});
        } else if (piece.equals("WK") || piece.equals("BK")) {
            return Arrays.asList(new int[][]{{1, 1}, {1, -1}, {-1, -1}, {-1, 1}});
        }
        return new ArrayList<>();
    }

    private String checkWin(String[][] board) {
        int whiteCount = 0;
        int blackCount = 0;
        for (int row = 0; row < 8; row++) {
            for (int col = 0; col < 8; col++) {
                if (board[row][col] != null) {
                    if (board[row][col].startsWith("W")) {
                        whiteCount++;
                    } else if (board[row][col].startsWith("B")) {
                        blackCount++;
                    }
                }
            }
        }
        if (whiteCount == 0) {
            return "B";
        } else if (blackCount == 0) {
            return "W";
        }
        return null;
    }
}
