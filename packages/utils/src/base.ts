/**
 * 返回数组中的每个第 n 个元素
 * @param {array} arr - 第一个数字
 * @param {number} nth - 第二个数字
 * @returns {array} 结果数组
 */
const everyNth = (arr: any[], nth: number):any[] => arr.filter((e, i) => i % nth === 0);
export { everyNth };
