/**
 * 身份证生成器核心工具函数
 */

// 区域代码映射
interface AreaCodeMap {
  [key: string]: string;
}

// 省级行政区代码
export const provinceCodes: AreaCodeMap = {
  '11': '北京市',
  '12': '天津市',
  '13': '河北省',
  '14': '山西省',
  '15': '内蒙古自治区',
  '21': '辽宁省',
  '22': '吉林省',
  '23': '黑龙江省',
  '31': '上海市',
  '32': '江苏省',
  '33': '浙江省',
  '34': '安徽省',
  '35': '福建省',
  '36': '江西省',
  '37': '山东省',
  '41': '河南省',
  '42': '湖北省',
  '43': '湖南省',
  '44': '广东省',
  '45': '广西壮族自治区',
  '46': '海南省',
  '50': '重庆市',
  '51': '四川省',
  '52': '贵州省',
  '53': '云南省',
  '54': '西藏自治区',
  '61': '陕西省',
  '62': '甘肃省',
  '63': '青海省',
  '64': '宁夏回族自治区',
  '65': '新疆维吾尔自治区',
};

// 简化的城市代码 (实际项目中可扩充更多城市)
export const cityCodes: AreaCodeMap = {
  '1100': '北京市',
  '1200': '天津市',
  '1301': '石家庄市',
  '1401': '太原市',
  '1501': '呼和浩特市',
  '2101': '沈阳市',
  '2201': '长春市',
  '2301': '哈尔滨市',
  '3100': '上海市',
  '3201': '南京市',
  '3301': '杭州市',
  '3401': '合肥市',
  '3501': '福州市',
  '3601': '南昌市',
  '3701': '济南市',
  '4101': '郑州市',
  '4201': '武汉市',
  '4301': '长沙市',
  '4401': '广州市',
  '4402': '深圳市',
  '4501': '南宁市',
  '4601': '海口市',
  '5000': '重庆市',
  '5101': '成都市',
  '5201': '贵阳市',
  '5301': '昆明市',
  '5401': '拉萨市',
  '6101': '西安市',
  '6201': '兰州市',
  '6301': '西宁市',
  '6401': '银川市',
  '6501': '乌鲁木齐市',
};

/**
 * 生成随机数字
 * @param min 最小值
 * @param max 最大值
 * @returns 随机数
 */
const getRandomNum = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

/**
 * 生成随机日期
 * @param start 开始年份
 * @param end 结束年份
 * @returns 格式化的日期字符串 YYYYMMDD
 */
const getRandomDate = (start: number, end: number): string => {
  const year = getRandomNum(start, end);
  const month = getRandomNum(1, 12);
  
  // 根据月份确定天数
  let day;
  if (month === 2) {
    // 处理闰年
    day = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0 
      ? getRandomNum(1, 29) 
      : getRandomNum(1, 28);
  } else if ([4, 6, 9, 11].includes(month)) {
    day = getRandomNum(1, 30);
  } else {
    day = getRandomNum(1, 31);
  }
  
  return `${year}${month.toString().padStart(2, '0')}${day.toString().padStart(2, '0')}`;
};

/**
 * 计算身份证校验码
 * @param id 前17位身份证号
 * @returns 校验码
 */
const calculateCheckCode = (id: string): string => {
  if (id.length !== 17) {
    throw new Error('身份证号前17位长度不正确');
  }
  
  // 加权因子
  const weight = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2];
  // 校验码对应值
  const checkCodeMap = ['1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2'];
  
  // 计算加权和
  let sum = 0;
  for (let i = 0; i < 17; i++) {
    sum += parseInt(id.charAt(i)) * weight[i];
  }
  
  // 计算模11的余数，映射到校验码
  const remainder = sum % 11;
  return checkCodeMap[remainder];
};

/**
 * 生成单个身份证号
 * @param areaCode 区域代码前缀（可选）
 * @param startYear 出生年份范围开始
 * @param endYear 出生年份范围结束
 * @returns 完整的18位身份证号
 */
export const generateIdCard = (
  areaCode?: string,
  startYear: number = 1950,
  endYear: number = 2000
): string => {
  // 如果没有指定区域代码，随机选择一个
  const prefix = areaCode || Object.keys(cityCodes)[getRandomNum(0, Object.keys(cityCodes).length - 1)];
  
  // 生成出生日期
  const birthDate = getRandomDate(startYear, endYear);
  
  // 生成顺序码（3位数字）
  const sequenceCode = getRandomNum(1, 999).toString().padStart(3, '0');
  
  // 组合前17位
  const idCardPrefix = `${prefix}00`.substring(0, 6) + birthDate + sequenceCode;
  
  // 计算校验码
  const checkCode = calculateCheckCode(idCardPrefix);
  
  // 返回完整18位身份证号
  return idCardPrefix + checkCode;
};

/**
 * 批量生成身份证号
 * @param count 数量
 * @param areaCode 区域代码前缀（可选）
 * @param startYear 出生年份范围开始
 * @param endYear 出生年份范围结束
 * @returns 身份证号数组
 */
export const batchGenerateIdCards = (
  count: number,
  areaCode?: string,
  startYear: number = 1950,
  endYear: number = 2000
): string[] => {
  const result: string[] = [];
  for (let i = 0; i < count; i++) {
    result.push(generateIdCard(areaCode, startYear, endYear));
  }
  return result;
};
