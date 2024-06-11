package com.koozka.controller;

import com.koozka.exception.InvalidGameException;
import com.koozka.exception.NotFoundException;
import com.koozka.model.Game;
import com.koozka.model.GameMove;
import com.koozka.model.GamePlay;
import com.koozka.model.Player;
import com.koozka.service.GameService;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@CrossOrigin("*")
@RestController
@Slf4j
@AllArgsConstructor
public class GameController {
    private final GameService gameService;
    private final SimpMessagingTemplate simpleMessagingTemplate;

    @MessageMapping("/move")
    @SendTo("/topic/game-progress")
    public GameMove processMove(GameMove move) {
        // Przetwórz ruch, np. aktualizuj stan gry
        // Dla demonstracji, po prostu zwracamy ruch
        return move;
    }

    @PostMapping("game/start")
    public ResponseEntity<Game> start(@RequestBody String login) {
        log.info("Start game request: {}", login);
        return ResponseEntity.ok(gameService.createGame(login));
    }

    @PostMapping("game/connect/random")
    public ResponseEntity<Game> connectRandom(@RequestBody String login) throws NotFoundException {
        log.info("Connect random {}", login);
        Game game = gameService.connectToRandomGame(login);
        return ResponseEntity.ok(game);
    }

    @PostMapping("game/gameplay")
    public ResponseEntity<Game> gamePlay(@RequestBody GamePlay request) throws InvalidGameException, NotFoundException {
        log.info("Gameplay: {}", request);
        Game game = gameService.gamePlay(request);
        simpleMessagingTemplate.convertAndSend("/topic/game-progress/" + game.getId(), game);
        return ResponseEntity.ok(game);
    }
}
