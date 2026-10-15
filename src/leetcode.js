// Fetches a problem's sample test cases from LeetCode's GraphQL API.

const GRAPHQL_URL = 'https://leetcode.com/graphql';

const QUESTION_QUERY = `
  query getQuestion($titleSlug: String!) {
    question(titleSlug: $titleSlug) {
      title
      exampleTestcaseList
      content
    }
  }
`;

// "https://leetcode.com/problems/two-sum/description/" -> "two-sum"
function getSlugFromUrl(url) {
  const match = url.match(/leetcode\.com\/problems\/([a-z0-9-]+)/i);
  return match ? match[1].toLowerCase() : null;
}

function htmlToText(html) {
  return html
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&');
}

// LeetCode does not return expected outputs separately, so we read them
// from the "Output: ..." lines inside the problem description.
function parseOutputs(html) {
  const text = htmlToText(html);
  const outputs = [];
  const regex = /Output:\s*(.+)/g;
  let match;
  while ((match = regex.exec(text)) !== null) {
    outputs.push(match[1].trim());
  }
  return outputs;
}

async function fetchProblem(slug) {
  const response = await fetch(GRAPHQL_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Referer: `https://leetcode.com/problems/${slug}/`
    },
    body: JSON.stringify({ query: QUESTION_QUERY, variables: { titleSlug: slug } })
  });

  if (!response.ok) {
    throw new Error(`LeetCode request failed with status ${response.status}`);
  }

  const { data } = await response.json();
  const question = data && data.question;
  if (!question) {
    throw new Error(`Problem "${slug}" not found`);
  }
  if (!question.content) {
    throw new Error('Problem content is not available (it may be a premium problem)');
  }

  const inputs = question.exampleTestcaseList || [];
  const outputs = parseOutputs(question.content);
  const count = Math.min(inputs.length, outputs.length);

  const testCases = [];
  for (let i = 0; i < count; i++) {
    testCases.push({ input: inputs[i], output: outputs[i] });
  }

  return { title: question.title, testCases };
}

module.exports = { getSlugFromUrl, parseOutputs, fetchProblem };
