/*
 * interactive play portion of the ZPY board
 */
import * as React from 'react'

import { ZPY } from 'lib/zpy/zpy.ts'
import * as ZPYEngine from 'lib/zpy/engine.ts'

import { range } from 'utils/iterable.ts'

import assert from 'utils/assert.ts'


export class ConfigArea extends React.Component<ConfigArea.Props, {}> {
  constructor(props: ConfigArea.Props) {
    super(props);
  }

  renderOption<K extends ConfigArea.Key>(
    label: any,
    key: K,
    val: ConfigArea.T[K],
    tooltip?: string,
  ) {
    const classes = [key as string];
    if (val === this.props.config[key]) classes.push('selected');

    if (tooltip) {
      return <div
        key={'' + val}
        className={classes.join(' ')}
        aria-label={tooltip}
        data-balloon-pos="up"
        onClick={ev => this.props.onChange(key, val)}
      >
        {label}
      </div>;
    }

    return <div
      key={'' + val}
      className={classes.join(' ')}
      onClick={ev => this.props.onChange(key, val)}
    >
      {label}
    </div>;
  }

  render() {
    const pr = this.props;
    const nplayers = pr.nplayers >= 4 ? pr.nplayers : 4;

    return <div className="config-container">
      game settings
      <div className="config">
        <label className="ndecks">
          <div># decks</div>
          <div className="config-options">
            {[...range(
              Math.floor(0.4 * nplayers),
              Math.floor(0.8 * nplayers) + 1,
            )].map(
              i => this.renderOption(i, 'ndecks', i)
            )}
          </div>
        </label>
        <label className="rank-skip">
          <div>rank up</div>
          <div className="config-options">
            {this.renderOption(
              'host once', 'rank', ZPY.RankSkipRule.HOST_ONCE,
              'must host 5,10,J,K once before ranking past',
            )}
            {this.renderOption(
              'no skip', 'rank', ZPY.RankSkipRule.NO_SKIP,
              'must pause at 5,10,J,K before ranking past (no skipping)',
            )}
            {this.renderOption(
              'no pass', 'rank', ZPY.RankSkipRule.NO_PASS,
              'can only rank up past 5,10,J,K by winning as host',
            )}
            {this.renderOption(
              'no rule', 'rank', ZPY.RankSkipRule.NO_RULE,
              'no rank up restrictions',
            )}
          </div>
        </label>
        <label className="kitty-mult">
          <div>kitty</div>
          <div
            className="config-options"
            aria-label={
              "multiplier for points in the kitty, based on n = " +
              "size of the attacking team's winning play"
            }
            data-balloon-pos="up"
            data-balloon-length="large"
          >
            {this.renderOption(
              <>2<sup><i>n</i></sup></>,
              'kitty', ZPY.KittyMultiplierRule.EXP
            )}
            {this.renderOption(
              <>2<i>n</i></>,
              'kitty', ZPY.KittyMultiplierRule.MULT
            )}
          </div>
        </label>
      </div>
    </div>;
  }
}

export namespace ConfigArea {

export type T = ZPYEngine.Config & {ndecks: number};
export type Key = keyof T;

export type Props = {
  nplayers: number;
  config: T;

  onChange: (key: Key, val: any) => void;
};

}