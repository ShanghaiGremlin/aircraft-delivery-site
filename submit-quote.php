<?php
if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $to = "your@email.com";  // Replace with your email address
    $subject = "New Quote Request";

    $fields = [
        "name", "email", "phone", "aircraft_registration", "aircraft_model",
        "owner_name", "ownership", "operator", "pickup_airport", "delivery_airport",
        "delivery_method", "delivery_date", "avionics", "engine_description",
        "budget", "supplemental_info"
    ];

    $message = "";
    foreach ($fields as $field) {
        $value = $_POST[$field] ?? "(not provided)";
        $message .= ucfirst(str_replace("_", " ", $field)) . ": " . $value . "\n";
    }

    // Handle aircraft_use[] checkboxes
    if (!empty($_POST['aircraft_use'])) {
        $message .= "Aircraft Use: " . implode(", ", $_POST['aircraft_use']) . "\n";
    }

    $headers = "From: noreply@yourdomain.com\r\n"; // Replace if needed

    if (mail($to, $subject, $message, $headers)) {
        echo "Thank you! Your quote request has been sent.";
    } else {
        echo "Error sending your request. Please try again later.";
    }
} else {
    echo "Invalid request.";
}
?>
