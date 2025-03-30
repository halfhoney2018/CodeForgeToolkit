import { useState, useCallback } from 'react';

// 性别类型
export type Gender = '男' | '女';

// 随机生成的个人信息
export interface PersonInfo {
  id: string;
  name: string;
  gender: Gender;
  idCard: string;
  phone: string;
  email: string;
  address: string;
  company: string;
  job: string;
  birthday: string;
  age: number;
}

// 历史记录项
export interface HistoryItem {
  id: string;
  timestamp: number;
  data: PersonInfo[];
}

/**
 * 获取范围内的随机整数
 * @param min 最小值（包含）
 * @param max 最大值（包含）
 * @returns 随机整数
 */
const getRandomInt = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

/**
 * 随机生成工具 Hook
 * @returns 生成工具状态和方法
 */
const useRandomGenerator = () => {
  // 生成的随机信息列表
  const [generatedInfo, setGeneratedInfo] = useState<PersonInfo[]>([]);
  // 生成数量
  const [generateCount, setGenerateCount] = useState<number>(1);
  // 历史记录
  const [history, setHistory] = useState<HistoryItem[]>([]);
  
  // 中文姓氏库
  const lastNames = [
    '李', '王', '张', '刘', '陈', '杨', '赵', '黄', '周', '吴',
    '徐', '孙', '胡', '朱', '高', '林', '何', '郭', '马', '罗',
    '梁', '宋', '郑', '谢', '韩', '唐', '冯', '于', '董', '萧',
    '程', '曹', '袁', '邓', '许', '傅', '沈', '曾', '彭', '吕',
    '苏', '卢', '蒋', '蔡', '贾', '丁', '魏', '薛', '叶', '阎',
    '余', '潘', '杜', '戴', '夏', '钟', '汪', '田', '任', '姜',
    '范', '方', '石', '姚', '谭', '廖', '邹', '熊', '金', '陆',
    '郝', '孔', '白', '崔', '康', '毛', '邱', '秦', '江', '史',
    '顾', '侯', '邵', '孟', '龙', '万', '段', '漕', '钱', '汤',
    '尹', '黎', '易', '常', '武', '乔', '贺', '赖', '龚', '文'
  ];
  
  // 中文名字库
  const firstNames = {
    male: [
      '伟', '强', '磊', '勇', '军', '杰', '涛', '斌', '超', '明',
      '刚', '平', '辉', '健', '俊', '华', '浩', '亮', '飞', '鹏',
      '宇', '波', '鑫', '昊', '龙', '海', '阳', '诚', '志', '远',
      '建', '峰', '渊', '旭', '东', '帆', '恒', '聪', '宁', '朗',
      '坚', '勤', '翰', '朝', '瑞', '崇', '润', '智', '捷', '博'
    ],
    female: [
      '芳', '娟', '敏', '静', '琳', '雪', '婷', '娜', '珊', '妍',
      '瑶', '怡', '倩', '琴', '云', '莉', '文', '晶', '丽', '玉',
      '洁', '燕', '娥', '茜', '月', '彤', '霞', '红', '梅', '露',
      '艳', '颖', '雯', '欣', '莹', '华', '蓉', '蕾', '林', '佳',
      '英', '雅', '韵', '璐', '媛', '婧', '嘉', '琪', '楠', '诗'
    ]
  };
  
  // 手机号前三位
  const phonePrefixes = [
    '130', '131', '132', '133', '134', '135', '136', '137', '138', '139',
    '150', '151', '152', '153', '155', '156', '157', '158', '159',
    '170', '171', '172', '173', '175', '176', '177', '178',
    '180', '181', '182', '183', '184', '185', '186', '187', '188', '189',
    '191', '199'
  ];
  
  // 常用邮箱后缀
  const emailSuffixes = [
    '@qq.com', '@163.com', '@126.com', '@gmail.com', '@outlook.com',
    '@hotmail.com', '@yahoo.com', '@sina.com', '@sohu.com', '@foxmail.com'
  ];
  
  // 公司后缀
  const companySuffixes = [
    '科技有限公司', '网络科技有限公司', '信息技术有限公司', '软件开发有限公司',
    '电子商务有限公司', '医疗器械有限公司', '贸易有限公司', '食品有限公司',
    '教育科技有限公司', '建筑工程有限公司', '娱乐传媒有限公司', '物流有限公司',
    '文化传播有限公司', '咨询服务有限公司', '投资管理有限公司', '能源科技有限公司'
  ];
  
  // 职业名称
  const jobTitles = [
    '软件工程师', '产品经理', 'UI设计师', '前端开发工程师', '后端开发工程师',
    '数据分析师', '项目经理', '测试工程师', '运维工程师', '销售经理',
    '市场专员', '人力资源专员', '财务主管', '行政专员', '客服专员',
    '教师', '医生', '护士', '律师', '会计', '记者', '编辑', '厨师',
    '建筑师', '设计师', '摄影师', '司机', '销售', '经理', '总监'
  ];
  
  // 省份列表
  const provinces = [
    '北京市', '天津市', '上海市', '重庆市', '河北省', '山西省', '辽宁省',
    '吉林省', '黑龙江省', '江苏省', '浙江省', '安徽省', '福建省', '江西省',
    '山东省', '河南省', '湖北省', '湖南省', '广东省', '海南省', '四川省',
    '贵州省', '云南省', '陕西省', '甘肃省', '青海省', '台湾省'
  ];
  
  // 城市列表 (简化版)
  const cities = [
    '北京市', '上海市', '广州市', '深圳市', '天津市', '南京市', '武汉市',
    '成都市', '杭州市', '重庆市', '西安市', '苏州市', '郑州市', '长沙市',
    '青岛市', '沈阳市', '大连市', '济南市', '宁波市', '无锡市', '厦门市',
    '福州市', '合肥市', '南昌市', '哈尔滨市', '长春市', '太原市', '石家庄市',
    '昆明市', '贵阳市', '南宁市', '兰州市', '海口市'
  ];
  
  // 道路名称
  const roads = [
    '中山路', '解放路', '人民路', '建设路', '和平路', '南京路', '北京路',
    '复兴路', '迎宾路', '友谊路', '昌平路', '长安街', '朝阳路', '万达路',
    '科技路', '高新路', '文化路', '学院路', '大学路', '工业路', '农业路',
    '商业街', '市场路', '东风路', '西湖路', '南湖路', '北湖路', '幸福路',
    '繁华街', '胜利路', '光明路', '兴隆路', '大同路', '五四路', '远大路'
  ];
  
  /**
   * 生成随机姓名
   * @param gender 性别，不指定则随机
   * @returns 随机姓名
   */
  const generateName = (gender?: Gender): { name: string, gender: Gender } => {
    const randomGender: Gender = gender || (Math.random() < 0.5 ? '男' : '女');
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    
    const firstNameList = randomGender === '男' ? firstNames.male : firstNames.female;
    const firstName = firstNameList[Math.floor(Math.random() * firstNameList.length)];
    
    // 有几率生成双字名
    const isDoubleName = Math.random() < 0.3;
    const secondFirstName = isDoubleName ? 
      firstNameList[Math.floor(Math.random() * firstNameList.length)] : 
      '';
    
    return {
      name: lastName + firstName + secondFirstName,
      gender: randomGender
    };
  };
  
  /**
   * 生成随机身份证号
   * @param gender 性别
   * @param birthYear 出生年份，不指定则随机生成(1950-2005)
   * @returns 身份证号
   */
  const generateIdCard = (gender: Gender, birthYear?: number): string => {
    // 地区码 (简化版，随机6位省市编码)
    const areaCode = String(getRandomInt(110000, 659000));
    
    // 出生日期
    const year = birthYear || getRandomInt(1950, 2005);
    const month = getRandomInt(1, 12).toString().padStart(2, '0');
    
    // 确保日期有效
    let maxDay = 31;
    if (['04', '06', '09', '11'].includes(month)) {
      maxDay = 30;
    } else if (month === '02') {
      // 简单的闰年判断
      maxDay = year % 4 === 0 ? 29 : 28;
    }
    
    const day = getRandomInt(1, maxDay).toString().padStart(2, '0');
    const birthDate = `${year}${month}${day}`;
    
    // 顺序码3位，其中最后一位奇数表示男性，偶数表示女性
    let sequenceCode = getRandomInt(10, 999).toString().padStart(3, '0');
    const lastDigit = parseInt(sequenceCode.charAt(2));
    
    if (gender === '男' && lastDigit % 2 === 0) {
      // 如果需要男性但最后一位是偶数，加1或减1使其成为奇数
      sequenceCode = sequenceCode.substring(0, 2) + (lastDigit === 0 ? '1' : (lastDigit - 1).toString());
    } else if (gender === '女' && lastDigit % 2 === 1) {
      // 如果需要女性但最后一位是奇数，加1或减1使其成为偶数
      sequenceCode = sequenceCode.substring(0, 2) + (lastDigit + 1).toString();
    }
    
    // 前17位
    const base = areaCode + birthDate + sequenceCode;
    
    // 计算校验码
    const weights = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2];
    let sum = 0;
    for (let i = 0; i < 17; i++) {
      sum += parseInt(base[i]) * weights[i];
    }
    
    const remainder = sum % 11;
    const checkCodeMap = ['1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2'];
    const checkCode = checkCodeMap[remainder];
    
    return base + checkCode;
  };
  
  /**
   * 从身份证号中提取出生日期
   * @param idCard 身份证号
   * @returns 生日字符串 YYYY-MM-DD
   */
  const extractBirthday = (idCard: string): string => {
    const year = idCard.substring(6, 10);
    const month = idCard.substring(10, 12);
    const day = idCard.substring(12, 14);
    return `${year}-${month}-${day}`;
  };
  
  /**
   * 计算年龄
   * @param birthday 生日字符串 YYYY-MM-DD
   * @returns 年龄
   */
  const calculateAge = (birthday: string): number => {
    const birthDate = new Date(birthday);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };
  
  /**
   * 生成随机手机号
   * @returns 随机手机号
   */
  const generatePhone = (): string => {
    const prefix = phonePrefixes[Math.floor(Math.random() * phonePrefixes.length)];
    const suffix = Math.floor(Math.random() * 100000000).toString().padStart(8, '0');
    return prefix + suffix;
  };
  
  /**
   * 生成随机邮箱
   * @param name 姓名，用于生成邮箱前缀
   * @returns 随机邮箱
   */
  const generateEmail = (name: string): string => {
    // 将姓名转为拼音的简化实现
    const pinyinMap: Record<string, string> = {
      '李': 'li', '王': 'wang', '张': 'zhang', '刘': 'liu', '陈': 'chen', 
      '杨': 'yang', '赵': 'zhao', '黄': 'huang', '周': 'zhou', '吴': 'wu'
    };
    
    let prefix = '';
    for (const char of name) {
      if (pinyinMap[char]) {
        prefix += pinyinMap[char];
      } else {
        // 对于没有映射的字符，随机生成
        prefix += String.fromCharCode(97 + Math.floor(Math.random() * 26));
      }
    }
    
    // 添加随机数
    prefix += Math.floor(Math.random() * 10000);
    
    const suffix = emailSuffixes[Math.floor(Math.random() * emailSuffixes.length)];
    return prefix + suffix;
  };
  
  /**
   * 生成随机公司名称
   * @returns 随机公司名称
   */
  const generateCompany = (): string => {
    const prefix1 = lastNames[Math.floor(Math.random() * lastNames.length)];
    const prefix2 = lastNames[Math.floor(Math.random() * lastNames.length)];
    const suffix = companySuffixes[Math.floor(Math.random() * companySuffixes.length)];
    return prefix1 + prefix2 + suffix;
  };
  
  /**
   * 生成随机职业
   * @returns 随机职业
   */
  const generateJob = (): string => {
    return jobTitles[Math.floor(Math.random() * jobTitles.length)];
  };
  
  /**
   * 生成随机地址
   * @returns 随机地址
   */
  const generateAddress = (): string => {
    const province = provinces[Math.floor(Math.random() * provinces.length)];
    const city = cities[Math.floor(Math.random() * cities.length)];
    const road = roads[Math.floor(Math.random() * roads.length)];
    const number = getRandomInt(1, 1000);
    
    return `${province}${city}${road}${number}号`;
  };
  
  /**
   * 生成随机信息
   * @returns 随机生成的个人信息
   */
  const generateRandomInfo = (): PersonInfo => {
    // 生成随机姓名和性别
    const { name, gender } = generateName();
    
    // 生成身份证
    const idCard = generateIdCard(gender);
    
    // 从身份证提取生日
    const birthday = extractBirthday(idCard);
    
    // 计算年龄
    const age = calculateAge(birthday);
    
    // 生成其他信息
    const phone = generatePhone();
    const email = generateEmail(name);
    const company = generateCompany();
    const job = generateJob();
    const address = generateAddress();
    
    return {
      id: Date.now().toString(36) + Math.random().toString(36).substring(2),
      name,
      gender,
      idCard,
      phone,
      email,
      company,
      job,
      address,
      birthday,
      age
    };
  };
  
  /**
   * 批量生成随机信息
   */
  const generateBatch = useCallback(() => {
    const count = Math.min(Math.max(generateCount, 1), 100); // 限制在1-100之间
    const infoList: PersonInfo[] = [];
    
    for (let i = 0; i < count; i++) {
      infoList.push(generateRandomInfo());
    }
    
    setGeneratedInfo(infoList);
    
    // 添加到历史记录
    const historyItem: HistoryItem = {
      id: Date.now().toString(36) + Math.random().toString(36).substring(2),
      timestamp: Date.now(),
      data: [...infoList]
    };
    
    setHistory(prev => {
      const newHistory = [historyItem, ...prev];
      // 最多保留10条历史记录
      return newHistory.slice(0, 10);
    });
  }, [generateCount]);
  
  /**
   * 清空生成的信息
   */
  const clearGeneratedInfo = useCallback(() => {
    setGeneratedInfo([]);
  }, []);
  
  /**
   * 清空历史记录
   */
  const clearHistory = useCallback(() => {
    setHistory([]);
  }, []);
  
  /**
   * 从历史记录中恢复
   */
  const restoreFromHistory = useCallback((historyItem: HistoryItem) => {
    setGeneratedInfo(historyItem.data);
  }, []);
  
  return {
    generatedInfo,
    generateCount,
    history,
    setGenerateCount,
    generateBatch,
    clearGeneratedInfo,
    clearHistory,
    restoreFromHistory
  };
};

export default useRandomGenerator;
