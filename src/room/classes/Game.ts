import { client, TEAMS } from "..";
import { PlayableTeamId, PlayerObject, Position } from "../HBClient";
import { PLAY_TYPES } from "../plays/BasePlay";
import Chat from "../roomStructures/Chat";
import PlayerRecorder from "../structures/PlayerRecorder";
import PlayerStatManager from "../structures/PlayerStatManager";
import { toClock } from "../utils/haxUtils";
import ICONS from "../utils/Icons";
import Down from "./Down";
import WithStateStore from "./WithStateStore";

interface GameStore {
  kickOffPosition: Position;
}

export default class Game extends WithStateStore<GameStore, keyof GameStore> {
  /**
   * Score of the game
   */
  score: {
    red: number;
    blue: number;
  } = {
    red: 0,
    blue: 0,
  };
  offenseTeamId: PlayableTeamId = 1;

  /**
   * The current play class, always starts off as a KickOff with time of 0
   */
  play: PLAY_TYPES | null = null;
  down: Down = new Down();
  players: PlayerRecorder = new PlayerRecorder();
  stats: PlayerStatManager = new PlayerStatManager();
  private _canStartSnapPlay: boolean = true;

  updateStaticPlayers() {
    this.players.updateStaticPlayerList(this.offenseTeamId);
  }

  get defenseTeamId() {
    if (this.offenseTeamId === 1) return 2;
    if (this.offenseTeamId === 2) return 1;
    throw Error("DEFENSE IS 0");
  }

  get canStartSnapPlay() {
    return this._canStartSnapPlay;
  }

  setOffenseTeam(teamId: PlayableTeamId) {
    this.offenseTeamId = teamId;
  }

  swapOffenseAndUpdatePlayers() {
    if (this.offenseTeamId === 1) {
      console.log("change it to 2");
      this.setOffenseTeam(2);
    } else {
      console.log("change it to 1");
      this.setOffenseTeam(1);
    }
    // Also update static players
    this.players.updateStaticPlayerList(this.offenseTeamId);

    Chat.send(`Teams swapped! ${this.offenseTeamId} is now on offense`);
  }

  startSnapDelay() {
    this._canStartSnapPlay = false;
    setTimeout(() => {
      this._canStartSnapPlay = true;
    }, 2000);
  }

  /**
   * Set the gamess current play, while first validating and throwing an error if validation occurs
   */
  setPlay(play: PLAY_TYPES, player: PlayerObject | null) {
    // This will throw an error if any errors occur, and will be resolved by the ChatHandler
    play?.validateBeforePlayBegins(player);

    this.play = play;
    this.play.prepare();
    this.play.run();
  }

  endPlay() {
    // Play might be null because play could be ended before it even starts like off a snap penalty
    this.play?.cleanUp();
    this.play = null;
  }

  setScore(teamID: PlayableTeamId, score: number) {
    teamID === TEAMS.RED ? this.score.red === score : this.score.blue === score;
    return this;
  }

  addScore(teamID: PlayableTeamId, score: number) {
    teamID === TEAMS.RED
      ? (this.score.red += score)
      : (this.score.blue += score);
    return this;
  }

  getTime() {
    return client.getScores().time ?? 0;
  }

  getClock() {
    const time = this.getTime();
    return toClock(time);
  }

  sendScoreBoard() {
    Chat.send(
      `${ICONS.RedSquare} ${this.score.red} -  ${this.score.blue} ${ICONS.BlueSquare}`
    );
  }
}
