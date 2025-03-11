// 模拟utils.ts中的计分逻辑
const calculateSelectionScore = (dice) => {
  const selectedDice = dice.filter(die => die.selected && !die.locked);
  
  // 检查顺子
  const values = selectedDice.map(die => die.value).sort((a, b) => a - b);
  
  // 检查全顺 123456
  if (values.length === 6 && JSON.stringify(values) === JSON.stringify([1, 2, 3, 4, 5, 6])) {
    return 1500;
  }

  // 检查标准顺子 12345 或 23456
  if (values.length >= 5) {
    // 检查是否包含12345
    const has12345 = [1, 2, 3, 4, 5].every(v => values.includes(v));
    if (has12345) {
      // 计算剩余的1和5的分数
      let remainingScore = 0;
      // 统计每个点数的出现次数
      const counts = {};
      values.forEach(v => {
        counts[v] = (counts[v] || 0) + 1;
      });
      
      // 对于1和5，只有超过1次的才计入剩余分数
      if (counts[1] > 1) remainingScore += (counts[1] - 1) * 100;
      if (counts[5] > 1) remainingScore += (counts[5] - 1) * 50;
      
      return 500 + remainingScore;
    }

    // 检查是否包含23456
    const has23456 = [2, 3, 4, 5, 6].every(v => values.includes(v));
    if (has23456) {
      // 计算剩余的1和5的分数
      let remainingScore = 0;
      // 统计每个点数的出现次数
      const counts = {};
      values.forEach(v => {
        counts[v] = (counts[v] || 0) + 1;
      });
      
      // 对于1和5，计入剩余分数
      if (counts[1]) remainingScore += counts[1] * 100;
      if (counts[5] > 1) remainingScore += (counts[5] - 1) * 50;
      
      return 750 + remainingScore;
    }
  }

  // 统计每个点数的数量
  const counts = new Map();
  selectedDice.forEach(die => {
    counts.set(die.value, (counts.get(die.value) || 0) + 1);
  });

  let score = 0;
  
  // 处理连子得分
  for (const [value, count] of counts.entries()) {
    // 处理三个或更多相同点数的情况
    if (count >= 3) {
      // 计算基础分数
      let baseScore = 0;
      if (value === 1) {
        // 1的基础分是1000分（三个1）
        baseScore = 1000;
      } else {
        // 其他数字的基础分是数字值 * 100（三个相同）
        baseScore = value * 100;
      }
      
      // 计算倍数：每多一个相同点数，分数翻倍
      const multiplier = Math.pow(2, count - 3);
      score += baseScore * multiplier;
    } 
    // 处理剩余的1和5（如果有的话）
    else if (value === 1) {
      score += count * 100;
    } else if (value === 5) {
      score += count * 50;
    }
  }

  return score;
};

// 模拟骰子对象
const createDice = (values) => {
  return values.map((value, index) => ({
    id: index,
    value,
    selected: true,
    locked: false,
    type: 'NORMAL'
  }));
};

// 测试顺子得分
console.log('测试顺子得分:');
console.log('小顺(12345):', calculateSelectionScore(createDice([1, 2, 3, 4, 5])));
console.log('大顺(23456):', calculateSelectionScore(createDice([2, 3, 4, 5, 6])));
console.log('全顺(123456):', calculateSelectionScore(createDice([1, 2, 3, 4, 5, 6])));

// 测试顺子与1、5的组合
console.log('\n测试顺子与1、5的组合:');
console.log('小顺 + 1 (12345+1):', calculateSelectionScore(createDice([1, 2, 3, 4, 5, 1])));
console.log('小顺 + 5 (12345+5):', calculateSelectionScore(createDice([1, 2, 3, 4, 5, 5])));
console.log('大顺 + 1 (23456+1):', calculateSelectionScore(createDice([2, 3, 4, 5, 6, 1])));
console.log('大顺 + 5 (23456+5):', calculateSelectionScore(createDice([2, 3, 4, 5, 6, 5])));

// 测试连子得分
console.log('\n测试连子得分:');
console.log('三个2 (222):', calculateSelectionScore(createDice([2, 2, 2])));
console.log('四个2 (2222):', calculateSelectionScore(createDice([2, 2, 2, 2])));
console.log('五个2 (22222):', calculateSelectionScore(createDice([2, 2, 2, 2, 2])));
console.log('六个2 (222222):', calculateSelectionScore(createDice([2, 2, 2, 2, 2, 2])));

console.log('三个1 (111):', calculateSelectionScore(createDice([1, 1, 1])));
console.log('四个1 (1111):', calculateSelectionScore(createDice([1, 1, 1, 1])));
console.log('五个1 (11111):', calculateSelectionScore(createDice([1, 1, 1, 1, 1])));
console.log('六个1 (111111):', calculateSelectionScore(createDice([1, 1, 1, 1, 1, 1])));

// 测试混合组合
console.log('\n测试混合组合:');
console.log('三个2和一个1 (2221):', calculateSelectionScore(createDice([2, 2, 2, 1])));
console.log('四个2和一个1 (22221):', calculateSelectionScore(createDice([2, 2, 2, 2, 1])));
console.log('三个2和两个1 (22211):', calculateSelectionScore(createDice([2, 2, 2, 1, 1]))); 