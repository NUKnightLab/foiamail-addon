/**
* Callback for rendering the card for specific Drive items.
* @param {Object} e The event object.
* @return {CardService.Card} The card to show to the user.
*/
function onDriveItemsSelected(e) {
  console.log(e);
  var items = e.drive.selectedItems;
  // Include at most 5 items in the text.
  items = items.slice(0, 5);
  var text = items.map(function (item) {
    var title = item.title;
    // If neccessary, truncate the title to fit in the image.
    title = truncate(title);
    return title;
  }).join('\n');
  return createCatCard(text);
}
