# https://leetcode.com/problems/valid-parentheses/
import json


class Solution:
    def isValid(self, s: str) -> bool:
        pairs = {")": "(", "]": "[", "}": "{"}
        stack = []
        for ch in s:
            if ch in pairs:
                if not stack or stack.pop() != pairs[ch]:
                    return False
            else:
                stack.append(ch)
        return not stack


if __name__ == "__main__":
    s = json.loads(input())  # input line looks like "()[]{}"
    print(json.dumps(Solution().isValid(s)))  # prints true / false
