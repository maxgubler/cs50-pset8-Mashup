<?php
    
    $filename = "../readme-features.txt";
    $isread = is_readable($filename);
    $filestring = file_get_contents($filename);
    $filestring = str_replace("    ","&emsp;",$filestring);
    $readmeHTML = nl2br($filestring, true);

?>

<?=$readmeHTML?>