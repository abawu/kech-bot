import type { Express, Request, Response } from "express";
import { storage, type BotSession, type CartItem, type Order, type OrderStatus, type PaymentMethod } from "./storage";

type TelegramReplyMarkup = Record<string, unknown>;
type BotLanguage = "en" | "am";

type TelegramUser = {
  id: number;
  username?: string;
  first_name?: string;
};

type TelegramMessage = {
  message_id: number;
  text?: string;
  photo?: Array<{ file_id: string }>;
  contact?: { phone_number: string };
  location?: { latitude: number; longitude: number };
  chat: { id: number };
  from?: TelegramUser;
};

type TelegramCallbackQuery = {
  id: string;
  data?: string;
  from: TelegramUser;
  message?: TelegramMessage;
};

type TelegramUpdate = {
  update_id: number;
  message?: TelegramMessage;
  callback_query?: TelegramCallbackQuery;
};

type RecentChat = {
  chatId: number;
  username?: string;
  firstName?: string;
  source: "message" | "callback";
  seenAt: string;
};

const TELEGRAM_API_BASE = "https://api.telegram.org";
type GeoPoint = {
  latitude: number;
  longitude: number;
};

type DeliveryZone = {
  name: string;
  polygon: GeoPoint[];
};

const HAWASSA_DELIVERY_ZONES: DeliveryZone[] = [
  {
    name: "Hawassa core",
    polygon: [
      { latitude: 7.000, longitude: 38.420 },
      { latitude: 7.018, longitude: 38.405 },
      { latitude: 7.047, longitude: 38.398 },
      { latitude: 7.080, longitude: 38.404 },
      { latitude: 7.118, longitude: 38.426 },
      { latitude: 7.142, longitude: 38.460 },
      { latitude: 7.145, longitude: 38.498 },
      { latitude: 7.130, longitude: 38.532 },
      { latitude: 7.102, longitude: 38.555 },
      { latitude: 7.062, longitude: 38.565 },
      { latitude: 7.028, longitude: 38.559 },
      { latitude: 7.004, longitude: 38.540 },
      { latitude: 6.992, longitude: 38.500 },
      { latitude: 6.994, longitude: 38.455 },
    ],
  },
  {
    name: "Nearby Hawassa support area",
    polygon: [
      { latitude: 6.975, longitude: 38.390 },
      { latitude: 7.010, longitude: 38.372 },
      { latitude: 7.055, longitude: 38.368 },
      { latitude: 7.108, longitude: 38.380 },
      { latitude: 7.156, longitude: 38.410 },
      { latitude: 7.176, longitude: 38.454 },
      { latitude: 7.176, longitude: 38.515 },
      { latitude: 7.155, longitude: 38.560 },
      { latitude: 7.118, longitude: 38.585 },
      { latitude: 7.065, longitude: 38.595 },
      { latitude: 7.020, longitude: 38.590 },
      { latitude: 6.985, longitude: 38.565 },
      { latitude: 6.968, longitude: 38.520 },
      { latitude: 6.968, longitude: 38.445 },
    ],
  },
];

const HOME_BUTTON = "New Order";
const MY_ORDERS_BUTTON = "My Orders";
const HELP_BUTTON = "Help";
const HOME_BUTTON_AM = "አዲስ ትዕዛዝ";
const MY_ORDERS_BUTTON_AM = "የእኔ ትዕዛዞች";
const HELP_BUTTON_AM = "እገዛ";
const BACK_BUTTON = "Back";
const BACK_BUTTON_AM = "ተመለስ";

const PAYMENT_LABELS: Record<PaymentMethod, string> = {
  cash: "Cash on Delivery",
  bank_transfer: "Bank Transfer",
  mobile_money: "Mobile Payment",
};

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending_confirmation: "Order Received",
  accepted: "Accepted",
  preparing: "Preparing",
  on_the_way: "On the way",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

const STATUS_LABELS_AM: Record<OrderStatus, string> = {
  pending_confirmation: "ተቀብለናል",
  accepted: "ተቀባይነት አግኝቷል",
  preparing: "በዝግጅት ላይ",
  on_the_way: "በመንገድ ላይ",
  delivered: "ደርሷል",
  cancelled: "ተሰርዟል",
};

const recentChats = new Map<number, RecentChat>();
let pollingStarted = false;
let pollingOffset = 0;
const MENU_PAGE_SIZE = 8;

const translations = {
  en: {
    chooseLanguage: "Please choose your language 🌐",
    welcome: "Welcome {name} to Kech Delivery 👋\nበቅናሽ. በፍጥነት. እዘዙን! ከች እንላለን !",
    chooseCafe: "Choose a cafe for your new order 🍽️",
    chooseCategory: "{cafe} Menu 🍴\nChoose a category, or tap All to see the full menu 👇",
    menuHeader: "{cafe} Menu 🍴\nCategory: {category}\nPage {page} of {pageCount}\n\n{menu}{more}",
    menuMore: "\n\nClick Next to see {count} more item{s} ➡️",
    youSelected: "You selected {item} 👌\nPrice: {price}\nChoose quantity 🔢",
    orderSummary: "Your Order Summary 🧾\n{cafeLine}Items: {itemCount}\nLines: {lineCount}\n\n{items}\n\nItems Total: {itemsTotal}\nTakeaway Fee: {takeawayFee}\n{deliveryLine}Total: {total}",
    help: "Use New Order to choose a cafe, add items, review your total, then share contact and location before confirming. Delivery is available only inside Hawassa 📍",
    noOrders: "You do not have any orders yet.",
    recentOrders: "Your recent orders 📦\n\n{orders}",
    askContact: "Before confirming your order, please share your phone number 📞",
    askLocation: "Please share your delivery location 📍\nWe only deliver inside Hawassa city.",
    choosePayment: "Choose your payment method 💳",
    missingCheckout: "Your order is missing a few checkout details. Please continue checkout.",
    finalReview: "Please review your order before confirming ✅\n\nCafe: {cafe}\nItems: {itemCount}\n\n{items}\n\nItems Total: {itemsTotal}\nTakeaway Fee: {takeawayFee}\nDelivery Distance: {distance} km\nDelivery Fee: {deliveryFee}\nTotal: {total}\nPayment: {payment}\nPhone: {phone}\nLocation: Hawassa verified 📍",
    adminNewOrder: "New Order Received 🔔",
    statusUpdate: "Kech Delivery update 🛵\nOrder {orderId}: {status}",
    incompleteOrder: "Your order is incomplete. Please finish checkout first.",
    uploadReceiptFirst: "Please upload your payment receipt screenshot before confirming.",
    cafeUnavailable: "This cafe is no longer available.",
    orderPlaced: "Your order has been placed successfully 🎉\nOrder ID: {orderId}\nStatus: {status}\nThank you for ordering with Kech Delivery 🙏",
    continueOrder: "Use the buttons below to continue your order 👇",
    outOfZone: "Sorry, we currently deliver only in Hawassa and nearby supported areas 🚫📍\nPlease share a valid delivery location around Hawassa.",
    locationConfirmed: "Location confirmed ✅\nDelivery is available in your area ({zone}).",
    receiptReceived: "Receipt received successfully ✅",
    addedToOrder: "Added to your order 👍\nItem: {item}\nUnit Price: {unitPrice}\nQuantity: {quantity}\nSubtotal: {subtotal}\nItems Total: {itemsTotal}\nTakeaway Fee: {takeawayFee}\nCurrent Total: {currentTotal}",
    emptyOrder: "Your order is empty. Pick a cafe and start adding items.",
    itemUnavailable: "That item is unavailable.",
    orderCancelled: "Your current order was cancelled.",
    chooseAtLeastOne: "Add at least one item before checkout.",
    invalidMenuItem: "I couldn't find that menu item.",
    shareReceipt: "Please upload your payment receipt screenshot.",
    categories: "Categories",
    all: "All",
    viewCart: "View Cart",
    next: "Next",
    prev: "Prev",
    backToMenu: "Back to Menu",
    addAnotherItem: "Add Another Item",
    proceedToCheckout: "Proceed to Checkout",
    checkout: "Checkout",
    confirmOrder: "Confirm Order",
    cancel: "Cancel",
    back: "Back",
    backToCafes: "Back to Cafes",
    shareContact: "Share Contact",
    shareLocation: "Share Location",
    cash: "Cash on Delivery",
    bank: "Bank Transfer",
    mobile: "Mobile Payment",
    loadingMenu: "Loading menu...",
    openingItem: "Opening item...",
  },
  am: {
    chooseLanguage: "እባክዎ ቋንቋ ይምረጡ 🌐",
    welcome: "እንኳን ወደ Kech Delivery {name} በደህና መጡ 👋\nበቅናሽ. በፍጥነት. እዘዙን! ከች እንላለን !",
    chooseCafe: "ለአዲስ ትዕዛዝዎ ካፌ ይምረጡ 🍽️",
    chooseCategory: "{cafe} Menu 🍴\nምድብ ይምረጡ ወይም All በመጫን ሙሉ ሜኑን ይመልከቱ 👇",
    menuHeader: "{cafe} Menu 🍴\nምድብ: {category}\nገጽ {page} / {pageCount}\n\n{menu}{more}",
    menuMore: "\n\nቀጣይን በመጫን {count} ተጨማሪ እቃ{s} ይመልከቱ ➡️",
    youSelected: "{item} መርጠዋል 👌\nዋጋ: {price}\nብዛት ይምረጡ 🔢",
    orderSummary: "የትዕዛዝ ማጠቃለያ 🧾\n{cafeLine}የእቃ ብዛት: {itemCount}\nመስመሮች: {lineCount}\n\n{items}\n\nየእቃዎች ድምር: {itemsTotal}\nየፓኬጅ ክፍያ: {takeawayFee}\n{deliveryLine}ጠቅላላ: {total}",
    help: "አዲስ ትዕዛዝን በመጫን ካፌ ይምረጡ፣ እቃዎችን ያክሉ፣ ጠቅላላውን ይመልከቱ፣ ከዚያም ስልክና ሎኬሽን ያጋሩ 📍",
    noOrders: "እስካሁን ምንም ትዕዛዝ የለዎትም።",
    recentOrders: "የእርስዎ ትዕዛዞች 📦\n\n{orders}",
    askContact: "እባክዎ ትዕዛዝዎን ከማረጋገጥዎ በፊት ስልክ ቁጥርዎን ያጋሩ 📞",
    askLocation: "እባክዎ የማድረሻ ቦታዎን ያጋሩ 📍\nአገልግሎታችን በሀዋሳ ብቻ ነው።",
    choosePayment: "የክፍያ መንገድ ይምረጡ 💳",
    missingCheckout: "ትዕዛዝዎ አንዳንድ መረጃ ይጎድለዋል። እባክዎ ይቀጥሉ።",
    finalReview: "እባክዎ ትዕዛዝዎን ከማረጋገጥዎ በፊት ይከልሱ ✅\n\nካፌ: {cafe}\nየእቃ ብዛት: {itemCount}\n\n{items}\n\nየእቃዎች ድምር: {itemsTotal}\nየፓኬጅ ክፍያ: {takeawayFee}\nየመላኪያ ርቀት: {distance} km\nየመላኪያ ክፍያ: {deliveryFee}\nጠቅላላ: {total}\nየክፍያ መንገድ: {payment}\nስልክ: {phone}\nሎኬሽን: ተረጋግጧል 📍",
    adminNewOrder: "New Order Received 🔔",
    statusUpdate: "የKech Delivery ማሻሻያ 🛵\nትዕዛዝ {orderId}: {status}",
    incompleteOrder: "ትዕዛዝዎ አልተሟላም። እባክዎ ያጠናቅቁ።",
    uploadReceiptFirst: "እባክዎ የክፍያ ደረሰኝ ስክሪንሹት ያስገቡ።",
    cafeUnavailable: "ይህ ካፌ አሁን አይገኝም።",
    orderPlaced: "ትዕዛዝዎ በትክክል ተልኳል 🎉\nየትዕዛዝ ቁጥር: {orderId}\nሁኔታ: {status}\nKech Delivery እናመሰግናለን 🙏",
    continueOrder: "ለመቀጠል ከታች ያሉትን ቁልፎች ይጠቀሙ 👇",
    outOfZone: "ይቅርታ፣ አገልግሎታችን በሀዋሳ እና በአቅራቢያዋ አካባቢ ብቻ ነው 🚫📍\nእባክዎ ትክክለኛ ሎኬሽን ያጋሩ።",
    locationConfirmed: "ሎኬሽን ተረጋግጧል ✅\nአገልግሎት በእርስዎ አካባቢ ({zone}) ይገኛል።",
    receiptReceived: "ደረሰኝ በትክክል ደርሷል ✅",
    addedToOrder: "ወደ ትዕዛዝዎ ተጨምሯል 👍\nእቃ: {item}\nነጠላ ዋጋ: {unitPrice}\nብዛት: {quantity}\nንዑስ ድምር: {subtotal}\nየእቃዎች ድምር: {itemsTotal}\nየፓኬጅ ክፍያ: {takeawayFee}\nአሁን ጠቅላላ: {currentTotal}",
    emptyOrder: "ትዕዛዝዎ ባዶ ነው። እባክዎ እቃ ይጨምሩ።",
    itemUnavailable: "ይህ እቃ አይገኝም።",
    orderCancelled: "ያለው ትዕዛዝ ተሰርዟል።",
    chooseAtLeastOne: "ከመክፈያ በፊት ቢያንስ አንድ እቃ ያክሉ።",
    invalidMenuItem: "ይህን ሜኑ እቃ ማግኘት አልቻልኩም።",
    shareReceipt: "እባክዎ የክፍያ ደረሰኝ ስክሪንሹት ያስገቡ 🧾",
    categories: "ምድቦች",
    all: "All",
    viewCart: "ዘንቢል እይ",
    next: "ቀጣይ",
    prev: "ቀዳሚ",
    backToMenu: "ወደ ሜኑ ተመለስ",
    addAnotherItem: "ተጨማሪ እቃ ጨምር",
    proceedToCheckout: "ወደ መክፈያ ቀጥል",
    checkout: "መክፈያ",
    confirmOrder: "ትዕዛዝ አረጋግጥ",
    cancel: "ሰርዝ",
    back: "ተመለስ",
    backToCafes: "ወደ ካፌዎች ተመለስ",
    shareContact: "ስልክ አጋራ",
    shareLocation: "ሎኬሽን አጋራ",
    cash: "በእጅ ክፍያ",
    bank: "ባንክ ትራንስፈር",
    mobile: "ሞባይል ክፍያ",
    loadingMenu: "ሜኑ በመክፈት ላይ...",
    openingItem: "እቃውን በመክፈት ላይ...",
  },
} as const;

function getBotToken() {
  return process.env.TELEGRAM_BOT_TOKEN;
}

function getAdminChatId() {
  return process.env.TELEGRAM_ADMIN_CHAT_ID;
}

function getSecretToken() {
  return process.env.TELEGRAM_WEBHOOK_SECRET;
}

function isConfigured() {
  return Boolean(getBotToken());
}

function getLanguage(session?: BotSession): BotLanguage {
  return session?.language ?? "en";
}

function t(language: BotLanguage, key: keyof typeof translations.en, values?: Record<string, string | number>) {
  let template = translations[language][key] as string;
  if (!values) {
    return template;
  }

  for (const [token, value] of Object.entries(values)) {
    template = template.replaceAll(`{${token}}`, String(value));
  }

  return template;
}

function getHomeButton(language: BotLanguage) {
  return language === "am" ? HOME_BUTTON_AM : HOME_BUTTON;
}

function getOrdersButton(language: BotLanguage) {
  return language === "am" ? MY_ORDERS_BUTTON_AM : MY_ORDERS_BUTTON;
}

function getHelpButton(language: BotLanguage) {
  return language === "am" ? HELP_BUTTON_AM : HELP_BUTTON;
}

function getBackButton(language: BotLanguage) {
  return language === "am" ? BACK_BUTTON_AM : BACK_BUTTON;
}

function paymentLabel(method: PaymentMethod, language: BotLanguage) {
  if (language === "am") {
    if (method === "cash") return t(language, "cash");
    if (method === "bank_transfer") return t(language, "bank");
    return t(language, "mobile");
  }

  return PAYMENT_LABELS[method];
}

function adminStatusButtons(orderId: string, language: BotLanguage) {
  const labels =
    language === "am"
      ? {
          accepted: "ተቀብሏል",
          preparing: "በዝግጅት ላይ",
          on_the_way: "በመንገድ ላይ",
          delivered: "ደርሷል",
          cancelled: "ተሰርዟል",
        }
      : {
          accepted: "Accepted",
          preparing: "Preparing",
          on_the_way: "On The Way",
          delivered: "Delivered",
          cancelled: "Cancelled",
        };

  return inlineKeyboard([
    [{ text: labels.accepted, callback_data: `admin:${orderId}:accepted` }],
    [{ text: labels.preparing, callback_data: `admin:${orderId}:preparing` }],
    [{ text: labels.on_the_way, callback_data: `admin:${orderId}:on_the_way` }],
    [{ text: labels.delivered, callback_data: `admin:${orderId}:delivered` }],
    [{ text: labels.cancelled, callback_data: `admin:${orderId}:cancelled` }],
  ]);
}

function adminOrderText(order: Order) {
  const language = order.language ?? "en";
  const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);
  const itemsTotal = order.totalPrice - order.takeawayFee - order.deliveryFee;

  if (language === "am") {
    return `አዲስ ትዕዛዝ ደርሷል 🔔\nየትዕዛዝ ቁጥር: ${order.id}\nደንበኛ: ${order.customerUsername ? `@${order.customerUsername}` : "የTelegram ደንበኛ"}\nስልክ: ${order.customerPhone}\nካፌ: ${order.cafeName}\nየእቃ ብዛት: ${itemCount}\n\n${summarizeCart(order.items)}\n\nየእቃዎች ድምር: ${formatPrice(itemsTotal)}\nየፓኬጅ ክፍያ: ${formatPrice(order.takeawayFee)}\nየመላኪያ ርቀት: ${order.deliveryDistanceKm.toFixed(2)} km\nየመላኪያ ክፍያ: ${formatPrice(order.deliveryFee)}\nጠቅላላ: ${formatPrice(order.totalPrice)}\nየክፍያ መንገድ: ${paymentLabel(order.paymentMethod, "am")}\nሁኔታ: ${STATUS_LABELS_AM[order.status]}`;
  }

  return `New Order Received 🔔\nOrder ID: ${order.id}\nCustomer: ${order.customerUsername ? `@${order.customerUsername}` : "Telegram customer"}\nPhone: ${order.customerPhone}\nCafe: ${order.cafeName}\nItems: ${itemCount}\n\n${summarizeCart(order.items)}\n\nItems Total: ${formatPrice(itemsTotal)}\nTakeaway Fee: ${formatPrice(order.takeawayFee)}\nDelivery Distance: ${order.deliveryDistanceKm.toFixed(2)} km\nDelivery Fee: ${formatPrice(order.deliveryFee)}\nTotal: ${formatPrice(order.totalPrice)}\nPayment: ${paymentLabel(order.paymentMethod, "en")}\nStatus: ${STATUS_LABELS[order.status]}`;
}

function rememberChat(update: TelegramUpdate) {
  const message = update.message;
  if (message?.chat?.id) {
    recentChats.set(message.chat.id, {
      chatId: message.chat.id,
      username: message.from?.username,
      firstName: message.from?.first_name,
      source: "message",
      seenAt: new Date().toISOString(),
    });
    return;
  }

  const callback = update.callback_query;
  const callbackChatId = callback?.message?.chat?.id;
  if (callback && callbackChatId) {
    recentChats.set(callbackChatId, {
      chatId: callbackChatId,
      username: callback.from.username,
      firstName: callback.from.first_name,
      source: "callback",
      seenAt: new Date().toISOString(),
    });
  }
}

function telegramUrl(method: string) {
  return `${TELEGRAM_API_BASE}/bot${getBotToken()}/${method}`;
}

async function telegramJsonRequest<T>(
  method: string,
  body: Record<string, unknown>,
): Promise<T> {
  const response = await fetch(telegramUrl(method), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Telegram API ${method} failed: ${response.status} ${errorText}`);
  }

  const payload = (await response.json()) as { ok: boolean; result: T; description?: string };
  if (!payload.ok) {
    throw new Error(`Telegram API ${method} returned an error: ${payload.description ?? "unknown error"}`);
  }

  return payload.result;
}

async function telegramRequest(method: string, body: Record<string, unknown>) {
  await telegramJsonRequest(method, body);
}

async function sendMessage(
  chatId: string | number,
  text: string,
  replyMarkup?: TelegramReplyMarkup,
) {
  return await telegramJsonRequest<TelegramMessage>("sendMessage", {
    chat_id: chatId,
    text,
    reply_markup: replyMarkup,
  });
}

async function sendLocation(chatId: string | number, latitude: number, longitude: number) {
  await telegramRequest("sendLocation", {
    chat_id: chatId,
    latitude,
    longitude,
  });
}

async function sendPhoto(
  chatId: string | number,
  fileId: string,
  caption: string,
  replyMarkup?: TelegramReplyMarkup,
) {
  await telegramRequest("sendPhoto", {
    chat_id: chatId,
    photo: fileId,
    caption,
    reply_markup: replyMarkup,
  });
}

async function answerCallbackQuery(callbackQueryId: string, text?: string) {
  await telegramRequest("answerCallbackQuery", {
    callback_query_id: callbackQueryId,
    text,
  });
}

async function editMessage(
  chatId: string | number,
  messageId: number,
  text: string,
  replyMarkup?: TelegramReplyMarkup,
) {
  await telegramRequest("editMessageText", {
    chat_id: chatId,
    message_id: messageId,
    text,
    reply_markup: replyMarkup,
  });
}

async function deleteBotMessage(chatId: string | number, messageId: number) {
  await telegramRequest("deleteMessage", {
    chat_id: chatId,
    message_id: messageId,
  });
}

function homeKeyboard(language: BotLanguage) {
  return {
    keyboard: [
      [{ text: getHomeButton(language) }],
      [{ text: getOrdersButton(language) }, { text: getHelpButton(language) }],
    ],
    resize_keyboard: true,
  };
}

function contactKeyboard(language: BotLanguage) {
  return {
    keyboard: [
      [{ text: t(language, "shareContact"), request_contact: true }],
      [{ text: getBackButton(language) }],
    ],
    resize_keyboard: true,
    one_time_keyboard: true,
  };
}

function locationKeyboard(language: BotLanguage) {
  return {
    keyboard: [
      [{ text: t(language, "shareLocation"), request_location: true }],
      [{ text: getBackButton(language) }],
    ],
    resize_keyboard: true,
    one_time_keyboard: true,
  };
}

function inlineKeyboard(buttons: Array<Array<{ text: string; callback_data: string }>>) {
  return { inline_keyboard: buttons };
}

function chunkButtons(
  buttons: Array<{ text: string; callback_data: string }>,
  perRow = 2,
) {
  const rows: Array<Array<{ text: string; callback_data: string }>> = [];
  for (let index = 0; index < buttons.length; index += perRow) {
    rows.push(buttons.slice(index, index + perRow));
  }

  return rows;
}

function formatPrice(price: number) {
  return `${price} ETB`;
}

function formatCafeTitle(name: string) {
  return `${name} Menu`;
}

function getMenuCategory(cafeId: string, itemName: string) {
  const name = itemName.toLowerCase();

  if (cafeId === "chanolly-noodle") {
    if (name.includes("soup")) return "Soup";
    if (name.includes("salad")) return "Salad";
    if (name.includes("noodle")) return "Noodles";
    if (name.includes("rice")) return "Rice";
    if (name.includes("sizzling") || name.includes("lollipop")) return "Sizzling";
    if (name.includes("mojito")) return "Mojito";
    if (name.includes("smoothie")) return "Smoothies";
    if (name.includes("extra") || name.includes("water") || name.includes("size option")) return "Extras";
    return "Specials";
  }

  if (cafeId === "htown-cafe") {
    if (name.includes("burger")) return "Burgers";
    if (name.includes("pizza")) return "Pizza";
    if (name.includes("shawarma") || name.includes("roll")) return "Shawarma";
    if (name.includes("juice") || name.includes("shake") || name.includes("drink") || name.includes("water") || name.includes("soft")) return "Drinks";
    if (name.includes("sandwich")) return "Sandwich";
    if (name.includes("fajita")) return "Fajita";
    if (name.includes("chafan")) return "Chafan";
    if (name.includes("french") || name.includes("loaded")) return "Fries";
    if (name.includes("waffle") || name.includes("omlet") || name.includes("foul") || name.includes("chechebsa") || name.includes("fetira")) return "Light Meals";
    if (name.includes("borito")) return "Borito";
    return "Extras";
  }

  if (cafeId === "safeland-cafe") {
    if (name.includes("toast") || name.includes("pancake") || name.includes("omelet") || name.includes("egg") || name.includes("chechebsa") || name.includes("fetira")) return "Breakfast";
    if (name.includes("firfir") || name.includes("tibes")) return "Traditional";
    if (name.includes("pasta")) return "Pasta";
    if (name.includes("fish") || name.includes("fried chicken") || name.includes("chicken wing")) return "Fish & Chicken";
    if (name.includes("fajita") || name.includes("shawarma")) return "Fajita & Shawarma";
    if (name.includes("salad")) return "Salad";
    if (name.includes("sandwich")) return "Sandwich";
    if (name.includes("fries")) return "Fries";
    if (name.includes("burger")) return "Burgers";
    if (name.includes("pizza") || name.includes("burgerizza")) return "Pizza";
    return "Burrito & Tacos";
  }

  if (cafeId === "mountain-cafe") {
    if (name.includes("burger")) return "Burgers";
    if (name.includes("pizza")) return "Pizza";
    if (name.includes("loaded fries")) return "Loaded Fries";
    if (name.includes("sandwich")) return "Sandwich";
    if (name.includes("shawarma")) return "Shawarma";
    if (name.includes("salad")) return "Salad";
    if (name.includes("chicken")) return "Chicken";
    if (name.includes("burrito") || name.includes("fajita")) return "Burrito & Fajita";
    return "Snacks & Fish";
  }

  if (cafeId === "liyu-taim-migib-bet") {
    if (name.includes("water") || name.includes("soft")) return "Drinks";
    if (name.includes("key wot") || name.includes("misto") || name.includes("cornis") || name.includes("mayberaw") || name.includes("kitfo") || name.includes("fresh")) return "Additional";
    if (name.includes("dulet") || name.includes("senber") || name.includes("collection") || name.includes("tibs") || name.includes("besiga") || name.includes("beqibe") || name.includes("tefersho") || name.includes("bozena")) return "Main Dishes";
    return "Breakfast";
  }

  return "Burgers";
}

function getCafeCategories(cafeId: string, menu: Array<{ name: string }>) {
  const categories = Array.from(new Set(menu.map((item) => getMenuCategory(cafeId, item.name))));
  return ["All", ...categories];
}

function clampPage(page: number, pageCount: number) {
  if (pageCount <= 0) {
    return 0;
  }

  return Math.min(Math.max(page, 0), pageCount - 1);
}

function summarizeCart(cart: CartItem[]) {
  return cart
    .map(
      (item, index) =>
        `${index + 1}. ${item.name}\n   ${formatPrice(item.unitPrice)} x ${item.quantity} = ${formatPrice(item.unitPrice * item.quantity)}`,
    )
    .join("\n");
}

function calculateTotal(cart: CartItem[]) {
  return cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
}

function calculateGrandTotal(itemsTotal: number, takeawayFee: number) {
  return itemsTotal + takeawayFee;
}

function roundToTwo(value: number) {
  return Math.round(value * 100) / 100;
}

function calculateDistanceKm(
  from: { latitude: number; longitude: number },
  to: { latitude: number; longitude: number },
) {
  const toRadians = (degrees: number) => (degrees * Math.PI) / 180;
  const earthRadiusKm = 6371;
  const deltaLat = toRadians(to.latitude - from.latitude);
  const deltaLng = toRadians(to.longitude - from.longitude);
  const startLat = toRadians(from.latitude);
  const endLat = toRadians(to.latitude);

  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.sin(deltaLng / 2) *
      Math.sin(deltaLng / 2) *
      Math.cos(startLat) *
      Math.cos(endLat);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return roundToTwo(earthRadiusKm * c);
}

function calculateDeliveryFee(distanceKm: number) {
  if (distanceKm <= 1) {
    return 50;
  }

  if (distanceKm <= 2) {
    return 65;
  }

  if (distanceKm <= 3) {
    return 75;
  }

  if (distanceKm <= 4) {
    return 100;
  }

  if (distanceKm <= 5) {
    return 125;
  }

  if (distanceKm <= 6) {
    return 150;
  }

  if (distanceKm <= 7) {
    return 175;
  }

  if (distanceKm <= 8) {
    return 200;
  }

  if (distanceKm <= 9) {
    return 225;
  }

  if (distanceKm <= 10) {
    return 250;
  }

  return 250 + Math.ceil(distanceKm - 10) * 25;
}

async function sendTrackedMessage(
  session: BotSession,
  text: string,
  replyMarkup?: TelegramReplyMarkup,
) {
  const sent = await sendMessage(Number(session.chatId), text, replyMarkup);
  session.activeBotMessageId = sent.message_id;
  await storage.saveSession(session);
}

async function replaceTrackedMessage(
  session: BotSession,
  text: string,
  replyMarkup?: TelegramReplyMarkup,
) {
  if (session.activeBotMessageId) {
    try {
      await deleteBotMessage(Number(session.chatId), session.activeBotMessageId);
    } catch {
      // Ignore if Telegram already removed the previous bot message.
    }
  }

  await sendTrackedMessage(session, text, replyMarkup);
}

async function showLanguagePicker(chatId: number, session?: BotSession) {
  const currentSession = session ?? (await storage.getSession(String(chatId)));
  await replaceTrackedMessage(
    currentSession,
    t("en", "chooseLanguage"),
    inlineKeyboard([
      [{ text: "English", callback_data: "language:en" }],
      [{ text: "አማርኛ", callback_data: "language:am" }],
    ]),
  );
}

function isPointInPolygon(point: GeoPoint, polygon: GeoPoint[]) {
  let isInside = false;

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const current = polygon[i];
    const previous = polygon[j];

    const intersects =
      current.latitude > point.latitude !== previous.latitude > point.latitude &&
      point.longitude <
        ((previous.longitude - current.longitude) * (point.latitude - current.latitude)) /
          (previous.latitude - current.latitude) +
          current.longitude;

    if (intersects) {
      isInside = !isInside;
    }
  }

  return isInside;
}

function resolveHawassaDeliveryZone(latitude: number, longitude: number) {
  const point = { latitude, longitude };
  return HAWASSA_DELIVERY_ZONES.find((zone) =>
    isPointInPolygon(point, zone.polygon),
  );
}

async function sendWelcome(chatId: number, username?: string) {
  const session = await storage.getSession(String(chatId));
  session.username = username ?? session.username;
  const language = getLanguage(session);
  const displayName = username ? `@${username}` : language === "am" ? "ደንበኛ" : "customer";
  await replaceTrackedMessage(
    session,
    t(language, "welcome", { name: displayName }),
    homeKeyboard(language),
  );
}

async function sendCafeList(chatId: number) {
  const session = await storage.getSession(String(chatId));
  const language = getLanguage(session);
  const cafes = await storage.listCafes();
  await replaceTrackedMessage(
    session,
    t(language, "chooseCafe"),
    inlineKeyboard(cafes.map((cafe) => [{ text: cafe.name, callback_data: `cafe:${cafe.id}` }])),
  );
}

async function sendCafeMenu(chatId: number, cafeId: string) {
  const session = await storage.getSession(String(chatId));
  const language = getLanguage(session);
  const cafe = await storage.getCafe(cafeId);
  if (!cafe) {
    await replaceTrackedMessage(session, t(language, "cafeUnavailable"), homeKeyboard(language));
    return;
  }

  session.selectedCafeId = cafeId;
  session.selectedCategory = "All";
  await storage.saveSession(session);

  const categoryButtons = getCafeCategories(cafeId, cafe.menu).map((category) => ({
    text: category,
    callback_data: `category:${cafeId}:${encodeURIComponent(category)}`,
  }));

  await replaceTrackedMessage(
    session,
    t(language, "chooseCategory", { cafe: cafe.name }),
    inlineKeyboard([
      ...chunkButtons(categoryButtons, 2),
      [{ text: t(language, "backToCafes"), callback_data: "cafes:list" }],
    ]),
  );
}

async function sendCafeMenuPage(
  chatId: number,
  cafeId: string,
  requestedPage: number,
  category = "All",
) {
  const session = await storage.getSession(String(chatId));
  const language = getLanguage(session);
  const cafe = await storage.getCafe(cafeId);
  if (!cafe) {
    await replaceTrackedMessage(session, t(language, "cafeUnavailable"), homeKeyboard(language));
    return;
  }

  const filteredMenu =
    category === "All"
      ? cafe.menu
      : cafe.menu.filter((item) => getMenuCategory(cafeId, item.name) === category);
  const pageCount = Math.max(1, Math.ceil(filteredMenu.length / MENU_PAGE_SIZE));
  const page = clampPage(requestedPage, pageCount);
  const startIndex = page * MENU_PAGE_SIZE;
  const pageItems = filteredMenu.slice(startIndex, startIndex + MENU_PAGE_SIZE);
  const menuText = pageItems
    .map((item, index) => `${startIndex + index + 1}. ${item.name} - ${formatPrice(item.price)}`)
    .join("\n");
  const remainingItems = filteredMenu.length - (startIndex + pageItems.length);
  const navigationRow: Array<{ text: string; callback_data: string }> = [];
  session.selectedCafeId = cafeId;
  session.selectedCategory = category;
  await storage.saveSession(session);

  if (page > 0) {
    navigationRow.push({ text: "Prev", callback_data: `menu:${cafe.id}:${page - 1}:${encodeURIComponent(category)}` });
  }

  navigationRow.push({ text: "View Cart", callback_data: "cart:view" });

  if (page < pageCount - 1) {
    navigationRow.push({ text: "Next", callback_data: `menu:${cafe.id}:${page + 1}:${encodeURIComponent(category)}` });
  }

  await replaceTrackedMessage(
    session,
    `${formatCafeTitle(cafe.name)} 🍴\nCategory: ${category}\nPage ${page + 1} of ${pageCount}\n\n${menuText}${remainingItems > 0 ? `\n\nClick Next to see ${remainingItems} more item${remainingItems === 1 ? "" : "s"} ➡️` : ""}`,
    inlineKeyboard([
      ...chunkButtons(
        pageItems.map((item) => ({
          text: `${item.name} - ${formatPrice(item.price)}`,
          callback_data: `item:${cafe.id}:${item.id}:${page}:${encodeURIComponent(category)}`,
        })),
        2,
      ),
      navigationRow,
      [{ text: t(language, "categories"), callback_data: `categories:${cafe.id}` }],
    ]),
  );
}

async function sendQuantityPicker(
  chatId: number,
  cafeId: string,
  itemId: string,
  returnPage = 0,
  returnCategory = "All",
) {
  const session = await storage.getSession(String(chatId));
  const language = getLanguage(session);
  const cafe = await storage.getCafe(cafeId);
  const item = cafe?.menu.find((menuItem) => menuItem.id === itemId);

  if (!cafe || !item) {
    await replaceTrackedMessage(session, t(language, "invalidMenuItem"), homeKeyboard(language));
    return;
  }

  await replaceTrackedMessage(
    session,
    `You selected ${item.name} 👌\nPrice: ${formatPrice(item.price)}\nChoose quantity 🔢`,
    inlineKeyboard([
      [
        { text: "1", callback_data: `qty:${cafeId}:${itemId}:1:${returnPage}:${encodeURIComponent(returnCategory)}` },
        { text: "2", callback_data: `qty:${cafeId}:${itemId}:2:${returnPage}:${encodeURIComponent(returnCategory)}` },
        { text: "3", callback_data: `qty:${cafeId}:${itemId}:3:${returnPage}:${encodeURIComponent(returnCategory)}` },
      ],
      [
        { text: "4", callback_data: `qty:${cafeId}:${itemId}:4:${returnPage}:${encodeURIComponent(returnCategory)}` },
        { text: "5", callback_data: `qty:${cafeId}:${itemId}:5:${returnPage}:${encodeURIComponent(returnCategory)}` },
      ],
      [{ text: t(language, "backToMenu"), callback_data: `menu:${cafeId}:${returnPage}:${encodeURIComponent(returnCategory)}` }],
    ]),
  );
}

async function sendCartSummary(chatId: number, session: BotSession, includeCheckout = false) {
  if (session.cart.length === 0) {
    await replaceTrackedMessage(session, t(getLanguage(session), "emptyOrder"), homeKeyboard(getLanguage(session)));
    return;
  }

  const cafe = session.selectedCafeId ? await storage.getCafe(session.selectedCafeId) : undefined;
  const itemsTotal = calculateTotal(session.cart);
  const takeawayFee = cafe?.takeawayFee ?? 0;
  const deliveryDistanceKm =
    cafe && session.location ? calculateDistanceKm(cafe.location, session.location) : undefined;
  const deliveryFee =
    deliveryDistanceKm !== undefined ? calculateDeliveryFee(deliveryDistanceKm) : undefined;
  const total = calculateGrandTotal(itemsTotal, takeawayFee) + (deliveryFee ?? 0);
  const itemCount = session.cart.reduce((sum, item) => sum + item.quantity, 0);
  const text =
    `Your Order Summary 🧾\n` +
    `${cafe ? `Cafe: ${cafe.name}\n` : ""}` +
    `Items: ${itemCount}\n` +
    `Lines: ${session.cart.length}\n\n` +
    `${summarizeCart(session.cart)}\n\n` +
    `Items Total: ${formatPrice(itemsTotal)}\n` +
    `Takeaway Fee: ${formatPrice(takeawayFee)}\n` +
    `${deliveryFee !== undefined ? `Delivery Fee: ${formatPrice(deliveryFee)}\n` : ""}` +
    `Total: ${formatPrice(total)}`;

  await replaceTrackedMessage(
    session,
    text,
    inlineKeyboard(
      includeCheckout
        ? [
            [{ text: "Add Another Item", callback_data: "menu:back" }],
            [{ text: t(getLanguage(session), "proceedToCheckout"), callback_data: "checkout:start" }],
          ]
        : [
            [{ text: "Add Another Item", callback_data: "menu:back" }],
            [{ text: t(getLanguage(session), "checkout"), callback_data: "checkout:start" }],
          ],
    ),
  );
}

async function sendHelp(chatId: number) {
  const session = await storage.getSession(String(chatId));
  await replaceTrackedMessage(
    session,
    t(getLanguage(session), "help"),
    homeKeyboard(getLanguage(session)),
  );
}

async function sendOrders(chatId: number) {
  const session = await storage.getSession(String(chatId));
  const orders = await storage.listOrdersForCustomer(String(chatId));

  if (orders.length === 0) {
    await replaceTrackedMessage(session, t(getLanguage(session), "noOrders"), homeKeyboard(getLanguage(session)));
    return;
  }

  const text = orders
    .slice(0, 5)
    .map(
      (order) =>
        `${order.id} • ${order.cafeName} • ${formatPrice(order.totalPrice)} • ${STATUS_LABELS[order.status]}`,
    )
    .join("\n");

  await replaceTrackedMessage(session, t(getLanguage(session), "recentOrders", { orders: text }), homeKeyboard(getLanguage(session)));
}

async function promptForContact(chatId: number, session: BotSession) {
  session.awaitingContact = true;
  session.awaitingLocation = false;
  session.awaitingReceipt = false;
  await storage.saveSession(session);
  await replaceTrackedMessage(
    session,
    t(getLanguage(session), "askContact"),
    contactKeyboard(getLanguage(session)),
  );
}

async function promptForLocation(chatId: number, session: BotSession) {
  session.awaitingContact = false;
  session.awaitingLocation = true;
  session.awaitingReceipt = false;
  await storage.saveSession(session);
  await replaceTrackedMessage(
    session,
    t(getLanguage(session), "askLocation"),
    locationKeyboard(getLanguage(session)),
  );
}

async function promptForPayment(chatId: number, session: BotSession) {
  session.awaitingContact = false;
  session.awaitingLocation = false;
  session.awaitingReceipt = false;
  await storage.saveSession(session);
  await replaceTrackedMessage(
    session,
    "Choose your payment method 💳",
    inlineKeyboard([
      [{ text: PAYMENT_LABELS.cash, callback_data: "payment:cash" }],
      [{ text: PAYMENT_LABELS.bank_transfer, callback_data: "payment:bank_transfer" }],
      [{ text: PAYMENT_LABELS.mobile_money, callback_data: "payment:mobile_money" }],
      [{ text: "Back", callback_data: "checkout:back_to_location" }],
    ]),
  );
}

async function sendFinalReview(chatId: number, session: BotSession) {
  if (!session.selectedCafeId || !session.contactPhone || !session.location || !session.paymentMethod) {
    await replaceTrackedMessage(session, t(getLanguage(session), "missingCheckout"));
    return;
  }

  const cafe = await storage.getCafe(session.selectedCafeId);
  const itemsTotal = calculateTotal(session.cart);
  const itemCount = session.cart.reduce((sum, item) => sum + item.quantity, 0);
  const paymentLabel = PAYMENT_LABELS[session.paymentMethod];
  const takeawayFee = cafe?.takeawayFee ?? 0;
  const deliveryDistanceKm =
    cafe && session.location ? calculateDistanceKm(cafe.location, session.location) : 0;
  const deliveryFee = calculateDeliveryFee(deliveryDistanceKm);
  const total = calculateGrandTotal(itemsTotal, takeawayFee) + deliveryFee;

  await replaceTrackedMessage(
    session,
    `Please review your order before confirming ✅\n\nCafe: ${cafe?.name ?? "Unknown Cafe"}\nItems: ${itemCount}\n\n${summarizeCart(session.cart)}\n\nItems Total: ${formatPrice(itemsTotal)}\nTakeaway Fee: ${formatPrice(takeawayFee)}\nDelivery Distance: ${deliveryDistanceKm.toFixed(2)} km\nDelivery Fee: ${formatPrice(deliveryFee)}\nTotal: ${formatPrice(total)}\nPayment: ${paymentLabel}\nPhone: ${session.contactPhone}\nLocation: Hawassa verified 📍`,
    inlineKeyboard([
      [{ text: t(getLanguage(session), "back"), callback_data: "checkout:back_to_payment" }],
      [{ text: t(getLanguage(session), "confirmOrder"), callback_data: "order:confirm" }],
      [{ text: t(getLanguage(session), "cancel"), callback_data: "order:cancel" }],
    ]),
  );
}

async function notifyAdmin(order: Order) {
  const adminChatId = getAdminChatId();
  if (!adminChatId) {
    return;
  }
  const language = order.language ?? "en";
  const text = adminOrderText(order);

  if (order.receiptFileId) {
    await sendPhoto(
      adminChatId,
      order.receiptFileId,
      text,
      adminStatusButtons(order.id, language),
    );
  } else {
    await sendMessage(
      adminChatId,
      text,
      adminStatusButtons(order.id, language),
    );
  }

  await sendLocation(adminChatId, order.location.latitude, order.location.longitude);
}

async function updateCustomerOrderStatus(orderId: string, status: OrderStatus) {
  const order = await storage.updateOrderStatus(orderId, status);
  if (!order) {
    return;
  }

  const language = order.language ?? "en";
  const localizedStatus = language === "am" ? STATUS_LABELS_AM[status] : STATUS_LABELS[status];

  await sendMessage(
    Number(order.customerChatId),
    language === "am"
      ? `የKech Delivery ማሻሻያ 🛵\nትዕዛዝ ${order.id}: ${localizedStatus}`
      : `Kech Delivery update 🛵\nOrder ${order.id}: ${localizedStatus}`,
    homeKeyboard(language),
  );
}

async function confirmOrder(chatId: number, session: BotSession) {
  if (
    !session.selectedCafeId ||
    session.cart.length === 0 ||
    !session.contactPhone ||
    !session.location ||
    !session.paymentMethod
  ) {
    await replaceTrackedMessage(session, t(getLanguage(session), "incompleteOrder"));
    return;
  }

  if ((session.paymentMethod === "bank_transfer" || session.paymentMethod === "mobile_money") && !session.receiptFileId) {
    await replaceTrackedMessage(session, t(getLanguage(session), "uploadReceiptFirst"));
    return;
  }

  const cafe = await storage.getCafe(session.selectedCafeId);
  if (!cafe) {
    await replaceTrackedMessage(session, t(getLanguage(session), "cafeUnavailable"));
    return;
  }

  const itemsTotal = calculateTotal(session.cart);
  const takeawayFee = cafe.takeawayFee;
  const deliveryDistanceKm = calculateDistanceKm(cafe.location, session.location);
  const deliveryFee = calculateDeliveryFee(deliveryDistanceKm);
  const totalPrice = calculateGrandTotal(itemsTotal, takeawayFee) + deliveryFee;

  const order = await storage.createOrder({
    customerChatId: String(chatId),
    customerUsername: session.username,
    language: getLanguage(session),
    customerPhone: session.contactPhone,
    cafeId: cafe.id,
    cafeName: cafe.name,
    items: session.cart,
    takeawayFee,
    deliveryDistanceKm,
    deliveryFee,
    totalPrice,
    paymentMethod: session.paymentMethod,
    receiptFileId: session.receiptFileId,
    location: session.location,
    status: "pending_confirmation",
  });

  await replaceTrackedMessage(
    session,
    t(getLanguage(session), "orderPlaced", { orderId: order.id, status: STATUS_LABELS[order.status] }),
    homeKeyboard(getLanguage(session)),
  );
  await notifyAdmin(order);
  await storage.clearSession(String(chatId));
}

async function handleTextMessage(message: TelegramMessage) {
  const chatId = message.chat.id;
  const text = message.text?.trim();
  const session = await storage.getSession(String(chatId));
  const language = getLanguage(session);
  session.username = message.from?.username ?? session.username;
  await storage.saveSession(session);

  if (!text) {
    return;
  }

  if (text === "/start") {
    await showLanguagePicker(chatId, session);
    return;
  }

  if (!session.language) {
    await showLanguagePicker(chatId, session);
    return;
  }

  if (text === getHomeButton(language)) {
    await sendCafeList(chatId);
    return;
  }

  if (text === getOrdersButton(language)) {
    await sendOrders(chatId);
    return;
  }

  if (text === getHelpButton(language)) {
    await sendHelp(chatId);
    return;
  }

  if (text === getBackButton(language)) {
    if (session.awaitingLocation) {
      await promptForContact(chatId, session);
      return;
    }

    if (session.awaitingContact) {
      await sendCartSummary(chatId, session, true);
      return;
    }
  }

    await replaceTrackedMessage(session, t(getLanguage(session), "continueOrder"), homeKeyboard(getLanguage(session)));
}

async function handleContactMessage(message: TelegramMessage) {
  const chatId = message.chat.id;
  const session = await storage.getSession(String(chatId));
  session.contactPhone = message.contact?.phone_number;
  await storage.saveSession(session);
  await promptForLocation(chatId, session);
}

async function handleLocationMessage(message: TelegramMessage) {
  const chatId = message.chat.id;
  const location = message.location;
  if (!location) {
    return;
  }

  const session = await storage.getSession(String(chatId));
  const matchedZone = resolveHawassaDeliveryZone(
    location.latitude,
    location.longitude,
  );

  if (!matchedZone) {
    session.awaitingLocation = true;
    await storage.saveSession(session);
    await replaceTrackedMessage(
      session,
      t(getLanguage(session), "outOfZone"),
      locationKeyboard(getLanguage(session)),
    );
    return;
  }

  session.location = {
    latitude: location.latitude,
    longitude: location.longitude,
  };
  await storage.saveSession(session);
  await replaceTrackedMessage(
    session,
    `Location confirmed ✅\nDelivery is available in your area (${matchedZone.name}).`,
  );
  await promptForPayment(chatId, session);
}

async function handleReceiptPhoto(message: TelegramMessage) {
  const chatId = message.chat.id;
  const session = await storage.getSession(String(chatId));
  if (!session.awaitingReceipt || !message.photo?.length) {
    return;
  }

  session.receiptFileId = message.photo[message.photo.length - 1]?.file_id;
  session.awaitingReceipt = false;
  await storage.saveSession(session);
  await replaceTrackedMessage(session, "Receipt received successfully ✅");
  await sendFinalReview(chatId, session);
}

async function handleCallbackQuery(callbackQuery: TelegramCallbackQuery) {
  const data = callbackQuery.data;
  const message = callbackQuery.message;
  if (!data || !message) {
    return;
  }

  const chatId = message.chat.id;
  const session = await storage.getSession(String(chatId));
  session.username = callbackQuery.from.username ?? session.username;
  await storage.saveSession(session);

  if (data.startsWith("language:")) {
    const language = data.split(":")[1] as BotLanguage;
    session.language = language;
    await storage.saveSession(session);
    await answerCallbackQuery(callbackQuery.id);
    await sendWelcome(chatId, callbackQuery.from.username);
    return;
  }

  if (!session.language) {
    await answerCallbackQuery(callbackQuery.id);
    await showLanguagePicker(chatId, session);
    return;
  }

  if (data.startsWith("cafe:")) {
    const cafeId = data.split(":")[1];
    session.selectedCafeId = cafeId;
    session.cart = [];
    session.contactPhone = undefined;
    session.location = undefined;
    session.paymentMethod = undefined;
    session.receiptFileId = undefined;
    await storage.saveSession(session);
    await answerCallbackQuery(callbackQuery.id);
    await sendCafeMenu(chatId, cafeId);
    return;
  }

  if (data.startsWith("item:")) {
    const [, cafeId, itemId, pageText, categoryText] = data.split(":");
    const page = Number(pageText ?? "0");
    const category = decodeURIComponent(categoryText ?? "All");
    await answerCallbackQuery(callbackQuery.id);
    await sendQuantityPicker(chatId, cafeId, itemId, Number.isNaN(page) ? 0 : page, category);
    return;
  }

  if (data.startsWith("qty:")) {
    const [, cafeId, itemId, qtyText, pageText, categoryText] = data.split(":");
    const quantity = Number(qtyText);
    const page = Number(pageText ?? "0");
    const category = decodeURIComponent(categoryText ?? "All");
    const cafe = await storage.getCafe(cafeId);
    const item = cafe?.menu.find((menuItem) => menuItem.id === itemId);

    if (!cafe || !item || Number.isNaN(quantity)) {
      await answerCallbackQuery(callbackQuery.id, "That item is unavailable.");
      return;
    }

    session.selectedCafeId = cafeId;
    session.cart.push({
      menuItemId: item.id,
      name: item.name,
      unitPrice: item.price,
      quantity,
    });
    await storage.saveSession(session);

    const subtotal = item.price * quantity;
    const itemsTotal = calculateTotal(session.cart);
    const takeawayFee = cafe.takeawayFee;
    const total = calculateGrandTotal(itemsTotal, takeawayFee);
    await answerCallbackQuery(callbackQuery.id, "Item added.");
    await replaceTrackedMessage(
      session,
      `Added to your order 👍\nItem: ${item.name}\nUnit Price: ${formatPrice(item.price)}\nQuantity: ${quantity}\nSubtotal: ${formatPrice(subtotal)}\nItems Total: ${formatPrice(itemsTotal)}\nTakeaway Fee: ${formatPrice(takeawayFee)}\nCurrent Total: ${formatPrice(total)}`,
      inlineKeyboard([
        [{ text: t(getLanguage(session), "addAnotherItem"), callback_data: `menu:${cafeId}:${Number.isNaN(page) ? 0 : page}:${encodeURIComponent(category)}` }],
        [{ text: "View Order", callback_data: "cart:view" }],
        [{ text: t(getLanguage(session), "checkout"), callback_data: "checkout:start" }],
      ]),
    );
    return;
  }

  if (data === "menu:back") {
    await answerCallbackQuery(callbackQuery.id);
    if (!session.selectedCafeId) {
      await sendCafeList(chatId);
      return;
    }

    await sendCafeMenuPage(chatId, session.selectedCafeId, 0, session.selectedCategory ?? "All");
    return;
  }

  if (data === "cafes:list") {
    await answerCallbackQuery(callbackQuery.id);
    await sendCafeList(chatId);
    return;
  }

  if (data.startsWith("categories:")) {
    const [, cafeId] = data.split(":");
    await answerCallbackQuery(callbackQuery.id);
    await sendCafeMenu(chatId, cafeId);
    return;
  }

  if (data.startsWith("category:")) {
    const [, cafeId, categoryText] = data.split(":");
    const category = decodeURIComponent(categoryText ?? "All");
    await answerCallbackQuery(callbackQuery.id);
    await sendCafeMenuPage(chatId, cafeId, 0, category);
    return;
  }

  if (data.startsWith("menu:")) {
    const [, cafeId, pageText, categoryText] = data.split(":");
    const page = Number(pageText ?? "0");
    const category = decodeURIComponent(categoryText ?? "All");
    await answerCallbackQuery(callbackQuery.id);
    await sendCafeMenuPage(chatId, cafeId, Number.isNaN(page) ? 0 : page, category);
    return;
  }

  if (data === "cart:view") {
    await answerCallbackQuery(callbackQuery.id);
    await sendCartSummary(chatId, session, true);
    return;
  }

  if (data === "checkout:start") {
    await answerCallbackQuery(callbackQuery.id);
    if (session.cart.length === 0) {
      await replaceTrackedMessage(session, "Add at least one item before checkout.");
      return;
    }

    await promptForContact(chatId, session);
    return;
  }

  if (data === "checkout:back_to_cart") {
    await answerCallbackQuery(callbackQuery.id);
    await sendCartSummary(chatId, session, true);
    return;
  }

  if (data === "checkout:back_to_contact") {
    await answerCallbackQuery(callbackQuery.id);
    await promptForContact(chatId, session);
    return;
  }

  if (data === "checkout:back_to_location") {
    await answerCallbackQuery(callbackQuery.id);
    await promptForLocation(chatId, session);
    return;
  }

  if (data === "checkout:back_to_payment") {
    await answerCallbackQuery(callbackQuery.id);
    await promptForPayment(chatId, session);
    return;
  }

  if (data.startsWith("payment:")) {
    const paymentMethod = data.split(":")[1] as PaymentMethod;
    session.paymentMethod = paymentMethod;
    session.awaitingReceipt = paymentMethod === "bank_transfer" || paymentMethod === "mobile_money";
    await storage.saveSession(session);
    await answerCallbackQuery(callbackQuery.id);

    if (session.awaitingReceipt) {
      await replaceTrackedMessage(session, "Please upload your payment receipt screenshot.");
      return;
    }

    await sendFinalReview(chatId, session);
    return;
  }

  if (data === "order:confirm") {
    await answerCallbackQuery(callbackQuery.id);
    await confirmOrder(chatId, session);
    return;
  }

  if (data === "order:cancel") {
    await answerCallbackQuery(callbackQuery.id, "Order cancelled.");
    await storage.clearSession(String(chatId));
    const clearedSession = await storage.getSession(String(chatId));
    await replaceTrackedMessage(clearedSession, t(getLanguage(clearedSession), "orderCancelled"), homeKeyboard(getLanguage(clearedSession)));
    return;
  }

  if (data.startsWith("admin:")) {
    const [, orderId, status] = data.split(":");
    await answerCallbackQuery(callbackQuery.id, "Order updated.");
    await updateCustomerOrderStatus(orderId, status as OrderStatus);
  }
}

async function processUpdate(update: TelegramUpdate) {
  if (!isConfigured()) {
    return;
  }

  rememberChat(update);

  if (update.message?.contact) {
    await handleContactMessage(update.message);
    return;
  }

  if (update.message?.location) {
    await handleLocationMessage(update.message);
    return;
  }

  if (update.message?.photo?.length) {
    await handleReceiptPhoto(update.message);
    return;
  }

  if (update.callback_query) {
    await handleCallbackQuery(update.callback_query);
    return;
  }

  if (update.message?.text) {
    await handleTextMessage(update.message);
  }
}

async function pollTelegramUpdates() {
  const updates = await telegramJsonRequest<TelegramUpdate[]>("getUpdates", {
    offset: pollingOffset,
    timeout: 30,
    allowed_updates: ["message", "callback_query"],
  });

  for (const update of updates) {
    pollingOffset = update.update_id + 1;
    await processUpdate(update);
  }
}

export function startTelegramPolling(log?: (message: string, source?: string) => void) {
  if (pollingStarted || !isConfigured()) {
    return;
  }

  pollingStarted = true;

  const run = async () => {
    while (pollingStarted) {
      try {
        await pollTelegramUpdates();
      } catch (error) {
        console.error("Telegram polling failed:", error);
        log?.("Telegram polling failed; retrying in 5s", "telegram");
        await new Promise((resolve) => setTimeout(resolve, 5000));
      }
    }
  };

  log?.("Telegram polling started", "telegram");
  void run();
}

export function registerTelegramRoutes(app: Express) {
  app.get("/api/telegram/health", async (_req: Request, res: Response) => {
    res.json({
      ok: true,
      configured: isConfigured(),
      hasAdminChat: Boolean(getAdminChatId()),
      webhookSecretConfigured: Boolean(getSecretToken()),
      pollingStarted,
    });
  });

  app.get("/api/telegram/debug/chats", async (_req: Request, res: Response) => {
    res.json({
      ok: true,
      chats: Array.from(recentChats.values()).sort((a, b) =>
        b.seenAt.localeCompare(a.seenAt),
      ),
    });
  });

  app.post("/api/telegram/webhook", async (req: Request, res: Response) => {
    if (!isConfigured()) {
      return res.status(503).json({ message: "Telegram bot token is not configured" });
    }

    const configuredSecret = getSecretToken();
    const receivedSecret = req.header("x-telegram-bot-api-secret-token");
    if (configuredSecret && receivedSecret !== configuredSecret) {
      return res.status(403).json({ message: "Invalid Telegram webhook secret" });
    }

    try {
      await processUpdate(req.body as TelegramUpdate);
      return res.json({ ok: true });
    } catch (error) {
      console.error("Telegram webhook processing failed:", error);
      return res.status(500).json({ message: "Failed to process Telegram update" });
    }
  });
}






