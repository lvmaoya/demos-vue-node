var merge = function (nums1, m, nums2, n) {
  // 截取num1前m项、num2前n项并合到num1中
  // let i = 0, j = 0;
  // while(i < n){
  //     nums1.pop();
  //     i++;
  // }
  // console.log(nums1)
  // while(j < n){
  //     nums1.push(nums2[j])
  //     j++;
  // }

  // for(let i = 0; i < n; i++){
  //     nums1[m + i] = nums2[i]
  // }
  // nums1.sort((a,b)=> a-b)
  // console.log(nums1)

  // 从两个数组的最大值开始比较，将较大的值放到 nums1 的最后面，这样就不会覆盖 nums1 中未处理的元素。
  let i = m - 1;
  let j = n - 1;
  let k = m + n - 1;

  while (j >= 0) {
    if (i >= 0 && nums1[i] > nums2[j]) {
      nums1[k] = nums1[i];
      i--;
    } else {
      nums1[k] = nums2[j];
      j--;
    }
    k--;
    console.log(i, j, k, nums1);
  }
  // console.log(nums1)
};

// merge([1,3,5,0,0,0], 3, [2,5,6], 3)
// var removeElement = function(nums, val) {
//     const k = nums.filter(item => item != val).length // k
//     const l = nums.length;
//     for(let i = 0; i<k;i++){
//         if(nums[i] == val){
//             nums.splice(i, 1)
//             nums.push(val)
//         }
//     }
//     console.log(nums)
//     nums.length = k
// };
// removeElement([0,1,2,2,3,0,4,2], 2)

// 26. 删除有序数组中的重复项
// 简单
// 相关标签
// premium lock icon
// 相关企业
// 提示
// 给你一个 非严格递增排列 的数组 nums ，请你 原地 删除重复出现的元素，使每个元素 只出现一次 ，返回删除后数组的新长度。元素的 相对顺序 应该保持 一致 。然后返回 nums 中唯一元素的个数。

// 考虑 nums 的唯一元素的数量为 k。去重后，返回唯一元素的数量 k。

// nums 的前 k 个元素应包含 排序后 的唯一数字。下标 k - 1 之后的剩余元素可以忽略。

// 判题标准:

// 系统会用下面的代码来测试你的题解:

// int[] nums = [...]; // 输入数组
// int[] expectedNums = [...]; // 长度正确的期望答案

// int k = removeDuplicates(nums); // 调用

// assert k == expectedNums.length;
// for (int i = 0; i < k; i++) {
//     assert nums[i] == expectedNums[i];
// }
// 如果所有断言都通过，那么您的题解将被 通过。

// 示例 1：

// 输入：nums = [1,1,2]
// 输出：2, nums = [1,2,_]
// 解释：函数应该返回新的长度 2 ，并且原数组 nums 的前两个元素被修改为 1, 2 。不需要考虑数组中超出新长度后面的元素。
// 示例 2：

// 输入：nums = [0,0,1,1,1,2,2,3,3,4]
// 输出：5, nums = [0,1,2,3,4,_,_,_,_,_]
// 解释：函数应该返回新的长度 5 ， 并且原数组 nums 的前五个元素被修改为 0, 1, 2, 3, 4 。不需要考虑数组中超出新长度后面的元素。

// 提示：

// 1 <= nums.length <= 3 * 104
// -100 <= nums[i] <= 100
// nums 已按 非递减 顺序排列。

var removeDuplicates = function (nums) {
  let i = 0;
  if (nums.length == 1) {
    return 1;
  }
  while (true) {
    if (nums[i + 1] == nums[i]) {
      nums.splice(i + 1, 1);
    } else {
      i++;
    }
    if (i == nums.length - 1) {
      return nums.length;
    }
  }
};
console.log(removeDuplicates([0, 0, 1, 1, 1, 2, 2, 3, 3, 4]));
console.log(removeDuplicates([1, 1, 2]));
console.log(removeDuplicates([1]));
