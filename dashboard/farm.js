// The farm plan, one function, no DOM, no imports: the model (lib/model.ts) and the
// dashboard (app.js) both call this, so board.json and the page can never disagree.
//
// A plan is eight steps, each one string: an action, then what it costs and how long it
// takes. Everything in a step comes from the protocol's own record — its category, its
// first chain, its TVL and its age — never from a hand-kept list of names.

/** The first chain a protocol names, or a neutral phrase. */
function chainOf(row) {
  return row.chains && row.chains.length > 0 ? row.chains[0] : 'its main chain';
}

/** How much capital one farm position needs, from the protocol's own TVL. */
function capitalFor(row) {
  if (row.tvl_usd >= 1_000_000_000) return 250;
  if (row.tvl_usd >= 250_000_000) return 150;
  if (row.tvl_usd >= 100_000_000) return 100;
  return 50;
}

/** About what one transaction costs on the protocol's main chain, in dollars. */
function gasFor(row) {
  var chain = chainOf(row);
  if (chain === 'Ethereum') return 8;
  if (chain === 'Solana') return 1;
  if (chain === 'Bitcoin') return 5;
  return 2;
}

/** How long to hold, from the protocol's age: younger protocols get a longer window. */
function holdDaysFor(age) {
  if (age === null || age === undefined) return 45;
  if (age < 180) return 60;
  if (age < 365) return 45;
  return 30;
}

/** The category, lowercased, for the action tables below. */
function catOf(row) {
  return (row.category || '').toLowerCase();
}

/** The main farming action: what to do with the capital, on which chain. */
function mainAction(row, capital, chain) {
  var c = catOf(row);
  var name = row.name;
  if (c.indexOf('lend') >= 0 || c.indexOf('cdp') >= 0 || c.indexOf('collateral') >= 0 || c.indexOf('uncollateralized') >= 0)
    return 'Supply $' + capital + ' of USDC to ' + name + ' on ' + chain + ' and keep the position open, so the wallet earns yield while it farms.';
  if (c.indexOf('dex') >= 0 || c.indexOf('yield aggregator') >= 0 || c.indexOf('leveraged farm') >= 0 || c.indexOf('farm') >= 0 || c.indexOf('liquidity manager') >= 0 || c.indexOf('indexes') >= 0)
    return 'Provide $' + capital + ' of liquidity to ' + name + "'s main pool on " + chain + ' and keep the position open through the next snapshot.';
  if (c.indexOf('bridge') >= 0 || c.indexOf('cross chain') >= 0)
    return 'Bridge $' + capital + ' of USDC to ' + chain + ' through ' + name + ', then use the bridged funds inside its app instead of bridging straight back.';
  if (c.indexOf('staking') >= 0 || c.indexOf('restak') >= 0)
    return "Stake $" + capital + " of the chain's staking asset through " + name + ' on ' + chain + ' and keep the receipt token in the same wallet.';
  if (c.indexOf('perpetual') >= 0 || c.indexOf('derivative') >= 0 || c.indexOf('basis') >= 0)
    return 'Deposit $' + capital + ' of USDC as margin on ' + name + ' on ' + chain + ' and open one small hedged position, not a leveraged bet.';
  if (c.indexOf('prediction') >= 0)
    return 'Fund $' + capital + ' and place one real market position on ' + name + ' on ' + chain + ', then leave the position to settle.';
  if (c.indexOf('curator') >= 0 || c.indexOf('allocator') >= 0 || c.indexOf('risk') >= 0)
    return 'Deposit $' + capital + ' into a ' + name + ' vault on ' + chain + ' and keep the vault shares in the farming wallet.';
  if (c.indexOf('stable') >= 0 || c.indexOf('dual-token') >= 0)
    return 'Mint or deposit $' + capital + ' of the stable asset through ' + name + ' on ' + chain + ' and hold it in the farming wallet.';
  if (c.indexOf('rwa') >= 0)
    return 'Mint $' + capital + ' of the yield-bearing asset ' + name + ' issues on ' + chain + ' and hold it for the full farming window.';
  if (c.indexOf('insurance') >= 0)
    return 'Buy $' + capital + ' of cover from ' + name + ' on ' + chain + ' and keep the policy active for the whole window.';
  if (c.indexOf('payment') >= 0 || c.indexOf('card') >= 0)
    return 'Load $' + capital + ' into ' + name + ' on ' + chain + ' and make one real payment with it, so the wallet shows genuine use.';
  if (c.indexOf('governance') >= 0)
    return 'Deposit $' + capital + ' into ' + name + "'s governance vault on " + chain + ' and vote in the next live proposal.';
  if (c.indexOf('otc') >= 0)
    return 'Place one $' + capital + ' order through ' + name + ' on ' + chain + ' and let it fill, rather than cancelling it at once.';
  if (c.indexOf('btc') >= 0 || c.indexOf('bitcoin') >= 0)
    return 'Deposit $' + capital + ' of the BTC-backed asset into ' + name + ' on ' + chain + ' and keep the position open.';
  if (c.indexOf('cedefi') >= 0)
    return 'Deposit $' + capital + ' into the ' + name + ' vault on ' + chain + ' and keep the shares until the window ends.';
  if (c.indexOf('chain') >= 0)
    return 'Bridge $' + capital + ' of USDC onto ' + chain + ' through ' + name + ' and make one transaction inside its own app.';
  return 'Deposit $' + capital + ' of USDC into ' + name + ' on ' + chain + ' and keep the position open for the whole window.';
}

/** The second qualifying action: a different on-chain move, so the wallet is not one-and-done. */
function secondAction(row, capital, chain) {
  var c = catOf(row);
  var name = row.name;
  if (c.indexOf('lend') >= 0 || c.indexOf('cdp') >= 0 || c.indexOf('collateral') >= 0 || c.indexOf('uncollateralized') >= 0)
    return 'Borrow a small amount against the supply, then repay it in full, so the wallet shows both sides of ' + name + "'s market.";
  if (c.indexOf('dex') >= 0 || c.indexOf('yield aggregator') >= 0 || c.indexOf('leveraged farm') >= 0 || c.indexOf('farm') >= 0 || c.indexOf('liquidity manager') >= 0 || c.indexOf('indexes') >= 0)
    return 'Swap once through ' + name + "'s pool on " + chain + ' and add a second, smaller liquidity position beside the first.';
  if (c.indexOf('bridge') >= 0 || c.indexOf('cross chain') >= 0)
    return 'Bridge a second, smaller amount back the other way through ' + name + ', so the wallet has volume in both directions.';
  if (c.indexOf('staking') >= 0 || c.indexOf('restak') >= 0)
    return 'Use the receipt token once inside ' + name + "'s own app on " + chain + ' instead of letting it sit idle.';
  if (c.indexOf('perpetual') >= 0 || c.indexOf('derivative') >= 0 || c.indexOf('basis') >= 0)
    return 'Close the first position, then open a second small one on the other side, so the wallet has two filled trades on ' + name + '.';
  if (c.indexOf('prediction') >= 0)
    return 'Place a second position in a different market on ' + name + ', smaller than the first, and let it settle too.';
  if (c.indexOf('curator') >= 0 || c.indexOf('allocator') >= 0 || c.indexOf('risk') >= 0)
    return 'Deposit a second, smaller amount into a different ' + name + ' vault on ' + chain + ' to show a repeat allocation.';
  if (c.indexOf('stable') >= 0 || c.indexOf('dual-token') >= 0)
    return 'Swap half the stable position for the paired asset and back through ' + name + ', so the wallet has a round trip on record.';
  if (c.indexOf('rwa') >= 0)
    return 'Claim or restake whatever yield the position has earned on ' + name + ' once, so the wallet shows an active claim.';
  if (c.indexOf('insurance') >= 0)
    return 'File a test quote for a second cover amount on ' + name + ' to confirm the policy is live and the wallet is active.';
  if (c.indexOf('payment') >= 0 || c.indexOf('card') >= 0)
    return 'Make a second, smaller payment with ' + name + ' a few days after the first, so the wallet shows repeat use.';
  if (c.indexOf('governance') >= 0)
    return 'Vote in a second proposal on ' + name + ' and leave a short comment in its forum if one is open.';
  if (c.indexOf('otc') >= 0)
    return 'Place a second, smaller order through ' + name + ' a few days later and let it fill as well.';
  if (c.indexOf('btc') >= 0 || c.indexOf('bitcoin') >= 0)
    return 'Move a small part of the position to a second ' + name + ' product on ' + chain + ' to show a second interaction.';
  if (c.indexOf('cedefi') >= 0)
    return 'Top up the vault with a second, smaller deposit a week later so ' + name + ' sees a returning depositor.';
  if (c.indexOf('chain') >= 0)
    return 'Make a second transaction inside ' + name + "'s own app on " + chain + ', a different action from the first.';
  return 'Do one more on-chain action in ' + name + "'s app on " + chain + ' — a swap, a vote or a second deposit — a few days after the first.';
}

/** The risk to watch, specific to what the position actually is. */
function riskNote(row) {
  var c = catOf(row);
  if (c.indexOf('dex') >= 0 || c.indexOf('yield aggregator') >= 0 || c.indexOf('leveraged farm') >= 0 || c.indexOf('farm') >= 0 || c.indexOf('liquidity manager') >= 0 || c.indexOf('indexes') >= 0)
    return 'Watch impermanent loss: if the pool assets drift apart, the position can lose value even while it earns fees, so check the pool price weekly.';
  if (c.indexOf('lend') >= 0 || c.indexOf('cdp') >= 0 || c.indexOf('collateral') >= 0 || c.indexOf('uncollateralized') >= 0)
    return 'Watch the health factor if you borrow: a sharp price move can liquidate the position, so keep the borrow small and the collateral well above the minimum.';
  if (c.indexOf('perpetual') >= 0 || c.indexOf('derivative') >= 0 || c.indexOf('basis') >= 0)
    return 'Leverage cuts both ways: keep the position small, never farm with borrowed money, and close it before the margin gets thin.';
  if (c.indexOf('bridge') >= 0 || c.indexOf('cross chain') >= 0)
    return 'Bridged assets carry bridge risk: wait for finality on both sides before moving on, and never bridge more than the position needs.';
  if (c.indexOf('staking') >= 0 || c.indexOf('restak') >= 0)
    return 'Staking can lock funds: check the unstaking delay and any slashing terms on ' + row.name + ' before you commit the capital.';
  if (c.indexOf('stable') >= 0 || c.indexOf('dual-token') >= 0)
    return 'Stable assets can depeg: check what backs the asset and how it held its peg in past stress before you hold a large amount.';
  if (c.indexOf('rwa') >= 0)
    return 'Real-world assets carry issuer and custody risk: the yield depends on an off-chain party, so read who holds the underlying before you mint.';
  if (c.indexOf('curator') >= 0 || c.indexOf('allocator') >= 0 || c.indexOf('risk') >= 0)
    return 'Vaults follow a strategy, not a promise: read what the vault holds and who manages it, because a bad strategy loses money the same as a bad trade.';
  if (c.indexOf('prediction') >= 0)
    return 'Prediction markets can resolve against you: only stake what you can lose, and check how the market settles before you place the position.';
  if (c.indexOf('insurance') >= 0)
    return 'Cover has exclusions: read what the policy actually pays for, because a claim outside its terms pays nothing.';
  return 'Smart-contract risk is real: never deposit more than you can afford to lose if the protocol is exploited, and check that its contracts are audited.';
}

/** One step as a single string: the action, then its cost and its time. */
function stepText(text, cost, time) {
  var s = text + ' Cost: ' + cost + '. Time: ' + time + '.';
  if (s.length > 600) s = s.slice(0, 596) + '...';
  if (s.length < 20) s = s + ' Hold the position and check the protocol’s own page.';
  return s;
}

/**
 * A protocol's farm plan: eight steps, each an action with a cost and a time. The plan is
 * derived from the protocol's own record (category, chains, TVL, age), never from a list of
 * names, and every step is a concrete move a reader can do.
 */
function farmSteps(row) {
  var chain = chainOf(row);
  var capital = capitalFor(row);
  var gas = gasFor(row);
  var hold = holdDaysFor(row.age_days);
  return [
    stepText(
      'Use a fresh wallet that holds only the funds you plan to farm, and keep its seed phrase offline, never in a screenshot or a chat.',
      'under $3 of gas for the first transaction',
      '5 minutes'
    ),
    stepText(
      mainAction(row, capital, chain),
      '$' + capital + ' of capital and about $' + gas + ' of gas',
      '15 minutes to set up'
    ),
    stepText(
      secondAction(row, capital, chain),
      'about $' + gas + ' of gas',
      '10 minutes'
    ),
    stepText(
      'Make one qualifying action each week, such as a deposit, a borrow, a swap or a vote, so the wallet stays active across snapshots.',
      'about $2 of gas a week',
      '10 minutes a week'
    ),
    stepText(
      'Hold the position for at least ' + hold + ' days so the activity is counted in more than one snapshot, and do not withdraw early.',
      'the $' + capital + ' stays in the position',
      hold + ' days'
    ),
    stepText(
      riskNote(row),
      'no fee to watch, only the risk itself',
      '5 minutes a week'
    ),
    stepText(
      'Before you withdraw, open the protocol’s own points or rewards page and claim only from the link it publishes: never pay to claim, never share your seed, and never trust a link from a DM.',
      'no fee to check',
      '10 minutes'
    ),
    stepText(
      'Write the wallet, the dates and every transaction in a farm log, so you can repeat the position or unwind it cleanly if the rules change.',
      'nothing but the log',
      '5 minutes'
    ),
  ];
}

// One file, two callers: the dashboard loads this as a plain script and reads
// window.farmSteps; the model (lib/model.ts) loads it through Node's require and
// reads the same function, so board.json and the page can never disagree.
if (typeof module !== 'undefined' && module.exports) module.exports = { farmSteps };
if (typeof window !== 'undefined') window.farmSteps = farmSteps;
