// 模拟utils.ts中的计分逻辑
const calculateSelectionScore = (dice) => {
  const selectedDice = dice.filter(die => die.selected && !die.locked);
  
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
      // 3个相同 = 1倍基础分，4个相同 = 2倍基础分，5个相同 = 4倍基础分，6个相同 = 8倍基础分
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

// 测试不同连子组合的得分
console.log('测试连子得分:');
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