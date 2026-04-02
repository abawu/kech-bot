import type { Express } from "express";
import type { Server } from "http";
import { registerTelegramRoutes } from "./telegram";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // put application routes here
  // prefix all routes with /api

  // use storage to perform CRUD operations on the storage interface
  // e.g. storage.insertUser(user) or storage.getUserByUsername(username)
  registerTelegramRoutes(app);

  return httpServer;
}
