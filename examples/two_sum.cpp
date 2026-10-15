// https://leetcode.com/problems/two-sum/
// LeetCode-style Solution class + a small main() that reads the
// sample input format: each parameter on its own line.
#include <bits/stdc++.h>
using namespace std;

class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        unordered_map<int, int> seen;
        for (int i = 0; i < (int)nums.size(); i++) {
            if (seen.count(target - nums[i])) return {seen[target - nums[i]], i};
            seen[nums[i]] = i;
        }
        return {};
    }
};

// "[2,7,11,15]" -> {2, 7, 11, 15}
vector<int> parseArray(string line) {
    for (char& c : line)
        if (c == '[' || c == ']' || c == ',') c = ' ';
    stringstream ss(line);
    vector<int> result;
    int x;
    while (ss >> x) result.push_back(x);
    return result;
}

int main() {
    string line;
    getline(cin, line);
    vector<int> nums = parseArray(line);
    int target;
    cin >> target;

    vector<int> ans = Solution().twoSum(nums, target);
    cout << "[";
    for (int i = 0; i < (int)ans.size(); i++) cout << (i ? "," : "") << ans[i];
    cout << "]\n";
}
