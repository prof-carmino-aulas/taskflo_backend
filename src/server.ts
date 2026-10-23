import { createApp } from "./app";

const PORT = Number(process.env.PORT ?? 3000);

// 0.0.0.0 permite acesso pelo emulador ou celular na mesma rede
createApp().listen(PORT, "0.0.0.0", () => {
  console.log(`TaskFlow API rodando em http://localhost:${PORT}/api/tasks`);
});
