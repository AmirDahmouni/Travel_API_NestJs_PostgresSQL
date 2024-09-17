function extractNumber(path: string): number {
  // Use a regular expression to extract the number before the image extension
  const match = path.match(/\d+(?=\.(jpg|png|jpeg|gif))/);

  // If a match is found, convert it to an integer; otherwise, return 0
  if (match) {
    return parseInt(match[0], 10);
  } else {
    return 0;
  }
}

export default extractNumber;
