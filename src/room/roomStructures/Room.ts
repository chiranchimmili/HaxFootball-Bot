import Game from "../classes/Game";
import HBClient from "../HBClient";
import { PLAY_TYPES } from "../plays/BasePlay";
import KickOff from "../plays/Kickoff";
import PlayerManager from "./Players";

export default class RoomClient {
  readonly client: HBClient;
  game: Game;
  readonly players: PlayerManager = new PlayerManager();
  private _isBotOn: boolean = true;

  constructor(client: HBClient) {
    this.client = client;
  }

  get isBotOn() {
    return this._isBotOn;
  }

  /**
   * Used when we know play has to be defined
   */
  getPlay<T extends PLAY_TYPES>() {
    if (!this.game.play) throw new Error("Game Error: Play is not defined");
    return this.game.play as T;
  }

  startNewGame() {
    this.game = new Game();
    this.game.setPlay(new KickOff(0), null);
  }
}
