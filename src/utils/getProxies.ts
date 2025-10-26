export async function fetchProxyList() {
  try {
    // Fetch the text data from the URL
    const response = await fetch(
      "https://proxy.webshare.io/api/v2/proxy/list/download/ljengbnnjkjwmfmnqyjkkizmjfzzocsojddbysxd/-/any/username/direct/-/"
    );

    // Check if the response is OK
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Get the text content
    const textData = await response.text();
    //console.log(textData);

    // Process the text data (e.g., split into lines)
    const proxies = textData.split("\n").map((line) => {
      const [ip, port, username, password] = line.split(":");
      return { ip, port, username, password };
    });

    //console.log(proxies);
    console.log(`[Proxy Loader]: ${proxies.length} proxies loaded`);
    return proxies;
  } catch (error) {
    console.error("Error fetching proxy list:", error);
    return [];
  }
}
