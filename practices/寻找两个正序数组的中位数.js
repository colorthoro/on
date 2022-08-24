/**
 * @param {number[]} nums1
 * @param {number[]} nums2
 * @return {number}
 */
let tr = Math.trunc;

function kthInNums(nums1, nums2, k) {
    let base1 = 0, base2 = 0;
    while (1) {
        // console.log(base1, base2);
        if (base1 >= nums1.length) {
            return nums2[base2 + k - 1];
        }
        if (base2 >= nums2.length) {
            return nums1[base1 + k - 1];
        }
        if (k == 1) {
            return Math.min(nums1[base1], nums2[base2]);
        }
        let anchor1 = Math.min(nums1.length - 1, tr(k / 2 - 1) + base1);
        let anchor2 = Math.min(nums2.length - 1, tr(k / 2 - 1) + base2);
        console.log(nums1[anchor1], nums2[anchor2])
        if (nums1[anchor1] <= nums2[anchor2]) {
            k -= anchor1 - base1 + 1;
            base1 = anchor1 + 1;
        } else {
            k -= anchor2 - base2 + 1;
            base2 = anchor2 + 1;
        }
    }
}

var findMedianSortedArrays = function (nums1, nums2) {
    let sumLen = nums1.length + nums2.length;
    if (sumLen % 2) {
        return kthInNums(nums1, nums2, tr(sumLen / 2) + 1);
    }
    return kthInNums(nums1, nums2, tr(sumLen / 2)) / 2 + kthInNums(nums1, nums2, tr(sumLen / 2) + 1) / 2;
};

console.log(findMedianSortedArrays([1, 2], [3, 4]));