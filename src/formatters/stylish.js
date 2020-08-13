import _ from 'lodash';

const indentSymbol = ' ';
const keyOffset = 2;
const prefixes = {
  added: '+',
  deleted: '-',
  unmodified: ' ',
};
const openSymbol = '{';
const closeSymbol = '}';

const addPrefix = (symbol, indent, prefix = '') => `${indent}${prefix}${symbol}`;

const stringify = (node, space, depth = 0) => {
  if (!_.isObject(node)) {
    return node;
  }
  const entries = Object.entries(node);
  return [
    openSymbol,
    ...(entries.flatMap(([key, value]) => `${addPrefix(key, space.repeat(depth + 1))}: ${stringify(value, space, depth + 1)}`)),
    `${addPrefix(closeSymbol, space.repeat(depth))}`,
  ].join('\n');
};

const stylish = (diffTree) => {
  const iter = (tree, depth) => {
    const indent = indentSymbol.repeat(depth + keyOffset);

    const result = tree.flatMap((item) => {
      switch (item.type) {
        case 'added':
          // формируем строку вида `{отступ}{префикс} {имя}: {значение}`
          return `${addPrefix(item.name, indent, prefixes.added)}: ${stringify(item.value, indent)}`;
        case 'deleted':
          return `${addPrefix(item.name, indent, prefixes.deleted)}: ${stringify(item.value, indent)}`;
        case 'modified':
          return `${addPrefix(item.name, indent, prefixes.deleted)}: ${stringify(item.value1, indent)}\n${addPrefix(item.name, indent, prefixes.added)}: ${stringify(item.value2, indent)}`;
        case 'unmodified':
          return `${addPrefix(item.name, indent, prefixes.unmodified)}: ${stringify(item.value, indent)}`;
        case 'nested':
          return [
            `${addPrefix(item.name, indent, prefixes.unmodified)}: ${openSymbol}`,
            ...(iter(item.children, depth + 4)), // с каждой итерацией прибавляем к глубине 4,
            // таким образом indent у всех детей с каждым погружением увеличивается на 4 пробела
            `${addPrefix(closeSymbol, indent)}`,
          ].join('\n');
        default:
          throw new Error(`Unknown type: '${item.type}'!`);
      }
    });
    return result;
  };
  return `{\n${iter(diffTree, 0).join('\n')}\n}`;
};

export default stylish;

console.log(stringify({ hello: 'world' }, ' '));

console.log(stringify({
  common: {
    setting1: 'Value 1',
    setting2: 200,
    setting3: true,
    setting6: {
      key: 'value',
      doge: {
        wow: 'too much',
      },
    },
  },
  group1: {
    baz: 'bas',
    foo: 'bar',
    nest: {
      key: 'value',
    },
  },
  group2: {
    abc: 12345,
    deep: {
      id: 45,
    },
  },
}, ' '));
