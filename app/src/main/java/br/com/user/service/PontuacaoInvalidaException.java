package br.com.user.service;

public class PontuacaoInvalidaException extends RuntimeException {

    public PontuacaoInvalidaException(String message) {
        super(message);
    }
}
