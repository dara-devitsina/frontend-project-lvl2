import _ from 'lodash';

const stringify = (item, currentDepth) => {
  if (_.isObject(item)) {
    const space = ' ';
    const [key, value] = Object.entries(item).flat();
    return `{\n${space.repeat(currentDepth + 8)}${key}: ${value}\n${space.repeat(currentDepth + 4)}}`;
  }
  return item;
};

const stylish = (diffTree) => {
  const iter = (node, depth) => {
    const space = ' ';
    const result = node.map((item) => {
      if (item.type !== 'nested') {
        switch (item.type) {
          case 'added':
            return `${space.repeat(depth + 2)}+ ${item.name}: ${stringify(item.value, depth)}`;
          case 'deleted':
            return `${space.repeat(depth + 2)}- ${item.name}: ${stringify(item.value, depth)}`;
          case 'modified':
            return `${space.repeat(depth + 2)}- ${item.name}: ${stringify(item.oldValue, depth)}\n${space.repeat(depth + 2)}+ ${item.name}: ${stringify(item.newValue, depth)}`;
          case 'unmodified':
            return `${space.repeat(depth + 4)}${item.name}: ${stringify(item.value, depth)}`;
          default:
            throw new Error(`Unknown status: '${item.type}'!`);
        }
      }
      return `${space.repeat(depth + 4)}${item.name}: ${iter(item.children, depth + 4)}`;
    });

    return `{\n${result.join('\n')}\n${space.repeat(depth)}}`;
  };
  return iter(diffTree, 0);
};

export default stylish;
