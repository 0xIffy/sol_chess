use anchor_lang::prelude::*;

const START_POS: &'static str = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

declare_id!("EBZ8p9zxdfFS5dJ1NBVGi1MWqwhVA5wKwA6kPQEGq1Js");

#[program]
pub mod chaoss {
  use super::*;
  pub fn initialize(ctx: Context<Initialize>) -> ProgramResult {
    let base_account = &mut ctx.accounts.base_account;
    base_account.total_games = 0;

    // println!("{:?}", ctx.program_id);
    // new_game(base_account);
    base_account.games.push(GameStruct::new_game());
    base_account.total_games += 1;

    Ok(())
  }

  pub fn make_move(ctx: Context<MakeMove>, mv: String, fen: String, _prev_fen: String, over: bool) -> Result<()> {
    let base_account = &mut ctx.accounts.base_account;
    let user = &mut ctx.accounts.user;
    let index = (base_account.total_games - 1) as usize;
    let game = &mut base_account.games[index];

    if _prev_fen == game.curr_board{
      let new_move = MoveStruct {
        player: *user.to_account_info().key,
        san: mv.to_string(),
        board_pos: fen.to_string()
      };

      game.curr_board = fen.to_string();
      game.num_moves += 1;
      game.moves.push(new_move);

      if over {
        base_account.games.push(GameStruct::new_game());
        base_account.total_games += 1;
      }

      Ok(())
    } else {
      Err(ErrorCode::BadFen.into())
    }
  }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
  #[account(init, payer = user, space = 9000)]
  pub base_account: Account<'info, BaseAccount>,
  #[account(mut)]
  pub user: Signer<'info>,
  pub system_program: Program <'info, System>
}

#[derive(Accounts)]
pub struct MakeMove<'info>{
  #[account(mut)]
  pub base_account: Account<'info, BaseAccount>,
  #[account(mut)]
  pub user: Signer<'info>
}

#[derive(Debug, Clone, AnchorSerialize, AnchorDeserialize)]
pub struct MoveStruct {
  pub player: Pubkey,
  pub san: String,
  pub board_pos: String,
  // pub timestamp: u128
}

#[derive(Debug, Clone, AnchorSerialize, AnchorDeserialize)]
pub struct GameStruct {
  pub curr_board: String,
  // pub timestamp: u128,
  pub num_moves: u128,
  pub moves: Vec<MoveStruct>
}

impl GameStruct {
  pub fn new_game() -> GameStruct {
    let game = GameStruct {
      curr_board: START_POS.to_string(),
      // timestamp: ,
      num_moves: 0,
      moves: Vec::new()
    };

    game
  }
}

#[account]
pub struct BaseAccount {
  pub games: Vec<GameStruct>,
  pub total_games: u128,
  // start_pos: String
}

#[error]
pub enum ErrorCode {
  #[msg("Previous board state does not match current state.")]
  BadFen
}