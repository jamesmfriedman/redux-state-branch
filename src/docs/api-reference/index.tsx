import React from 'react';
import './styles.css';
import generatedPropsJson from './generated-props.json';
const generatedProps = generatedPropsJson.typescript;

type GenPropsKey = keyof typeof generatedProps;

type Item = {
  example: string;
  description: string;
  options: GenPropsKey | Array<[string, string]>;
};

const docs = {
  stateBranch: {
    description: 'A factory for creating branches of your state.',
    example: `
      const myBranch = stateBranch<ItemT, ItemStateT>()(options)
    `,
    options: 'StateBranchOpts'
  },
  createSelectors: {
    description: 'A factory for creating selector primitives.',
    example: `const selectors = createSelectors<ItemT, ItemStateT>(options)`,
    options: 'CreateSelectorOpts'
  },
  createActions: {
    description: 'A factory for creating action primitives.',
    example: `const actions = createActions<ItemT, ItemStateT>(options)`,
    options: 'CreateActionsOpts'
  },
  createStore: {
    description: 'A factory for creating a Redux store.',
    example: `
export const store = createStore({
  devTools: true,
  middleware: [thunk],
  reducers: {
    [todosBranch.name]: todosBranch.reducer
  }
});
    `,
    options: 'CreateActionsOpts'
  }
};

export function ApiReference() {
  return (
    <div className="api">
      <h1>API Reference</h1>

      <h2>Factory Methods</h2>
      <Section>
        <Item name="stateBranch" />
        <Item name="createSelectors" />
        <Item name="createActions" />
        <Item name="createStore" />
      </Section>

      {/* <h2>Actions</h2>

      <h2>Selectors</h2>

      <h2>Utilities</h2> */}
    </div>
  );
}

function Section({ children }: { children: React.ReactNode }) {
  return (
    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Usage</th>
          <th>Options</th>
        </tr>
      </thead>
      <tbody>{children}</tbody>
    </table>
  );
}

function Item({ name }: { name: keyof typeof docs }) {
  const p = docs[name];

  return (
    <tr>
      <td>
        <code>{name}</code>
        <div>{p.description}</div>
      </td>

      <td>{p.example}</td>
      <td>
        {typeof p.options === 'string' ? (
          <Options name={p.options as GenPropsKey} />
        ) : (
          <ul>
            {(p.options as Array<[string, string]>).map(
              ([optName, optDescription]) => (
                <li key={optName}>
                  <b>{optName}</b> - {optDescription}
                </li>
              )
            )}
          </ul>
        )}
      </td>
    </tr>
  );
}

type Property = {
  documentation: {
    contents: string[];
    contentsRaw: string;
  };
  fileName: string;
  flags: {
    isExported: boolean;
    isExternal: boolean;
    isOptional: boolean;
    isPrivate: boolean;
    isProtected: boolean;
    isPublic: boolean;
    isRest: boolean;
    isStatic: boolean;
  };
  kind: string;
  name: string;
  sourceUrl: string;
  type: string;
};

function Options({ name }: { name: GenPropsKey }) {
  const section = generatedProps[name];
  const properties = ('properties' in section &&
  Array.isArray(section.properties)
    ? section.properties
    : []) as Property[];
  return (
    <ul>
      {properties.map(p => {
        return (
          <li key={p.name}>
            <b>{p.name}</b>: {p.type} - {p.documentation.contentsRaw}
          </li>
        );
      })}
    </ul>
  );
}
