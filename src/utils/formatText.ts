// utils/textFormatter.ts
export const formatText = (text: string): string => {
  // Replace **text** with <b>text</b>
  let formattedText = text.replace(/\*\*(.*?)\*\*/g, "<b>$1</b>");

  // Replace *text* and _text_ with <i>text</i>
  formattedText = formattedText.replace(/\*(.*?)\*/g, "<i>$1</i>");
  formattedText = formattedText.replace(/_(.*?)_/g, "<i>$1</i>");

  // Replace \n with <br> for new lines
  formattedText = formattedText.replace(/\n/g, "<br>");

  // replace `text` or ```text``` with code style
  formattedText = formattedText.replace(/`(.+?)`/g, "<code>$1</code>");

  // replace ~~text~~ with strikethrough
  formattedText = formattedText.replace(/~~(.*?)~~/g, "<s>$1</s>");

  // Return the formatted text
  return formattedText;
};
