package br.com.user.api;

import com.google.genai.Client;
import com.google.genai.types.GenerateContentResponse;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api")
public class GeminiControllerApi {

    @PostMapping("/ia")
    public Map<String, Object> chatWithIA(@RequestBody Map<String, Object> body) {
        try {
            // 1. Pega a mensagem enviada do frontend
            String prompt = (String) body.get("message");

            if (prompt == null || prompt.trim().isEmpty()) {
                return Map.of("reply", "Você precisa enviar uma mensagem.");
            }

            // 2. Cria o client direto com a chave que você mandou
            Client client = new Client.Builder()
                    .apiKey("AIzaSyABxSmdqHXYQAng1lyz6Fjbdmvh4sbtcdo")   // <-- SUA CHAVE AQUI
                    .build();

            // 3. Envia para o modelo Gemini
            GenerateContentResponse response =
                    client.models.generateContent(
                            "gemini-2.5-flash",
                            prompt,
                            null
                    );

            // 4. Extrai o texto da IA
            String text = response.text();

            // 5. Retorna para o frontend no formato que o chat espera
            return Map.of("reply", text);

        } catch (Exception e) {
            e.printStackTrace();
            return Map.of("reply", "Erro ao conectar com a IA: " + e.getMessage());
        }
    }
}
