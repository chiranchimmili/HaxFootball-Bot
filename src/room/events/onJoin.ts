import Room, { client } from "..";
import { FullPlayerObject } from "../HBClient";

export default function onJoin(player: FullPlayerObject) {
  if (!Room.isBotOn) return;

  client.setPlayerAdmin(player.id, true);
  if (client.getPlayerList().length === 1) {
    client.setPlayerTeam(player.id, 1);
    client.startGame();
  } else {
    client.setPlayerTeam(player.id, 2);
  }
}