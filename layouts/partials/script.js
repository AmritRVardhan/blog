document.addEventListener("DOMContentLoaded", function () {
    let date = new Date(new Date().getFullYear(), 0, 1);
    for (let dayNumber = 0; dayNumber < 8000; dayNumber++) {
      let daysToIncrease = Math.floor(Math.random() * 500),
        newDate = new Date(date);
      newDate.setDate(newDate.getDate() + daysToIncrease);
      $heat.addDate("heat-map-1", newDate, null, false);
    }
    $heat.refreshAll();
  });