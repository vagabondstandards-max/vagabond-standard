<?php
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Sanitize and collect form inputs
    $name = strip_tags(trim($_POST['name'] ?? ''));
    $phone = strip_tags(trim($_POST['phone'] ?? ''));
    $email = filter_var(trim($_POST['email'] ?? ''), FILTER_SANITIZE_EMAIL);
    $order = strip_tags(trim($_POST['order'] ?? ''));
    $address = strip_tags(trim($_POST['address'] ?? ''));

    $to = "vagabondstandards@gmail.com"; 
    $subject = "New Order from $name";
    
    $message = "New Order Received:\n\n";
    $message .= "Name: $name\n";
    $message .= "Phone: $phone\n";
    $message .= "Email: $email\n";
    $message .= "Order Details:\n$order\n\n";
    $message .= "Address:\n$address\n\n";
    $message .= "Time: " . date("d-m-Y h:i A");

    // Use a valid domain-matching sender email if possible to prevent spam blocks
    $headers = "From: no-reply@yourwebsite.com\r\n";
    if (!empty($email)) {
        $headers .= "Reply-To: $email\r\n";
    }
    $headers .= "X-Mailer: PHP/" . phpversion();

    // Attempt to send email
    if (mail($to, $subject, $message, $headers)) {
        echo "<h2>Order Placed! We will call you soon at $phone</h2>";
    } else {
        echo "<h2>Error sending order. Please contact us via WhatsApp.</h2>";
    }
} else {
    header("HTTP/1.1 403 Forbidden");
    echo "Direct access not permitted.";
}
?>