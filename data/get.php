<?php
  $url = 'https://api.covid19india.org/v2/state_district_wise.json';
  $result = file_get_contents($url);
  var_dump($result);
  file_put_contents('data.json', $result);

  date_default_timezone_set('Asia/Kolkata');
  $date = date('l\, jS M Y \a\t g:i a', time());
  $meta = array(
    "Last Update" => $date
  );
  var_dump($meta);
  file_put_contents('meta.json', json_encode($meta,true));
?>
