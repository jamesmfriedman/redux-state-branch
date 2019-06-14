import {
  StateBranch,
  resetAllBranches,
  Actions,
  Selectors,
  actionsFactory,
  selectorsFactory
} from '.';

type UserT = {
  id: string;
  name: string;
  description?: string;
};

const PREFIX = 'testBranch';

const DEFAULT_STATE = {
  metaItem: 'test',
  items: {
    testUser: {
      id: 'testUser',
      name: 'James Friedman'
    }
  }
};

type BranchStateT = typeof DEFAULT_STATE;

// mock the window crypto module
Object.defineProperty(window, 'crypto', {
  value: {
    getRandomValues: () => Math.random()
  }
});

const branch = new StateBranch({
  name: PREFIX,
  constants: {
    CUSTOM: 'CUSTOM_CONSTANT'
  },
  defaultState: DEFAULT_STATE
});

describe('StateBranch', () => {
  it('can init', () => {
    expect(branch.name).toBe('testBranch');
  });

  it('defaultState', () => {
    const state = branch.reducer(undefined, { type: 'noop' });
    expect(state).toEqual({ ...DEFAULT_STATE });
  });
});

describe('ID Generation', () => {
  const customIdBranch = new StateBranch({
    name: PREFIX,
    generateId: () => 'custom-id'
  });

  it('customId', () => {
    const action = customIdBranch.action.create({});
    expect(action.items[0].id).toBe('custom-id');
  });
});

describe('Constants', () => {
  it('CREATE', () => {
    expect(branch.constant.CREATE).toBe(`${PREFIX}/CREATE`);
  });

  it('REPLACE', () => {
    expect(branch.constant.REPLACE).toBe(`${PREFIX}/REPLACE`);
  });

  it('UPDATE', () => {
    expect(branch.constant.UPDATE).toBe(`${PREFIX}/UPDATE`);
  });

  it('REMOVE', () => {
    expect(branch.constant.REMOVE).toBe(`${PREFIX}/REMOVE`);
  });

  it('RESET', () => {
    expect(branch.constant.RESET).toBe(`${PREFIX}/RESET`);
  });

  it('SET_META', () => {
    expect(branch.constant.SET_META).toBe(`${PREFIX}/SET_META`);
  });

  it('custom', () => {
    expect(branch.constant.CUSTOM).toBe(`CUSTOM_CONSTANT`);
  });
});

describe('Actions', () => {
  it('create', () => {
    const action = branch.action.create({ name: 'Cookie Monster' });
    const item = action.items[0];
    const state = branch.reducer(undefined, action);
    expect(state.items[item.id]).toEqual(item);
  });

  it('update', () => {
    const action = branch.action.update({
      id: 'testUser',
      name: 'Cookie Monster'
    });
    const item = action.items[0];
    const state = branch.reducer(undefined, action);
    expect(state.items.testUser).toEqual(item);
  });

  it('allows partial update', () => {
    const action = branch.action.update({
      id: 'testUser',
      description: 'foo'
    });
    const item = action.items[0];
    const state = branch.reducer(undefined, action);
    expect(state.items.testUser).toEqual({
      ...DEFAULT_STATE.items.testUser,
      ...item
    });
  });

  it('replace', () => {
    const action = branch.action.replace({
      id: 'testUser',
      name: 'Cookie Monster'
    });
    const item = action.items[0];
    const state = branch.reducer(undefined, action);
    expect(state.items.testUser).toEqual(item);
  });

  it('remove by item', () => {
    const action = branch.action.remove({
      id: 'testUser'
    });
    const state = branch.reducer(undefined, action);
    expect(state.items.testUser).toBeUndefined();
  });

  it('remove by id', () => {
    const action = branch.action.remove('testUser');
    const state = branch.reducer(undefined, action);
    expect(state.items.testUser).toBeUndefined();
  });

  it('setMeta', () => {
    const action = branch.action.setMeta({ metaItem: 'changed' });
    const state = branch.reducer(undefined, action);
    expect(state.metaItem).toBe('changed');
  });

  it('reset', () => {
    const action = branch.action.update({
      id: 'testUser',
      name: 'Cookie Monster'
    });

    const state = branch.reducer(undefined, action);
    expect(state).not.toEqual(DEFAULT_STATE);

    const resetAction = branch.action.reset();
    const resetState = branch.reducer(state, resetAction);

    expect(resetState).toEqual(DEFAULT_STATE);
  });

  it('reset all branches', () => {
    const action = branch.action.update({
      id: 'testUser',
      name: 'Cookie Monster'
    });

    const state = branch.reducer(undefined, action);
    expect(state).not.toEqual(DEFAULT_STATE);

    const resetAction = resetAllBranches();
    const resetState = branch.reducer(state, resetAction);

    expect(resetState).toEqual(DEFAULT_STATE);
  });
});

describe('Custom Selectors', () => {
  class CustomSelectors extends Selectors<UserT, BranchStateT> {
    customSelector<StateT>(state: StateT) {
      return this.where(state, u => u.id === 'customUserId');
    }
  }

  const customSelectorsBranch = new StateBranch({
    name: 'customSelectors',
    defaultState: DEFAULT_STATE,
    selectors: CustomSelectors
  });

  it('customSelector', () => {
    customSelectorsBranch.action;
    const action = customSelectorsBranch.action.create({
      id: 'customUserId',
      name: 'Cookie Monster'
    });
    const item = action.items[0];
    const state = customSelectorsBranch.reducer(undefined, action);
    expect(
      customSelectorsBranch.select.customSelector({ customSelectors: state })
    ).toEqual([item]);
  });
});

describe('Custom Actions', () => {
  class CustomActions extends Actions<UserT, BranchStateT> {
    customAction() {
      return this.create({ id: 'customUser', name: 'Custom User' });
    }
  }

  const customActionsBranch = new StateBranch({
    name: 'customActions',
    defaultState: DEFAULT_STATE,
    actions: CustomActions
  });

  it('customAction', () => {
    const action = customActionsBranch.action.customAction();
    const item = action.items[0];
    const state = customActionsBranch.reducer(undefined, action);
    expect(state.items[item.id]).toEqual(item);
  });
});

describe('Selectors', () => {
  const branchState = branch.reducer(undefined, { type: 'noop' });
  const state = { [branch.name]: branchState };

  it('byId', () => {
    expect(branch.select.byId(state, 'testUser')).toBe(
      DEFAULT_STATE.items.testUser
    );
  });

  it('byId undefined', () => {
    expect(branch.select.byId(state, 'nonExistant')).toBeUndefined();
  });

  it('all', () => {
    expect(branch.select.all(state)).toEqual(Object.values(branchState.items));
  });

  it('where', () => {
    expect(branch.select.where(state, user => user.id === 'testUser')).toEqual([
      branchState.items.testUser
    ]);
  });

  it('where empty', () => {
    expect(
      branch.select.where(state, user => user.id === 'nonExistant')
    ).toEqual([]);
  });

  it('meta', () => {
    expect(branch.select.meta(state)).toEqual(branchState);
  });
});

describe('Utils', () => {
  const utilsBranch = new StateBranch({
    name: 'utilsBranch',
    utils: {
      test: 'exists',
      func: () => {}
    }
  });

  it('string', () => {
    expect(utilsBranch.util.test).toBe('exists');
  });

  it('func', () => {
    expect(typeof utilsBranch.util.func).toBe('function');
  });
});
