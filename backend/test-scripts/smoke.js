(async () => {
    const base = 'http://localhost:5000';
    const email = 'copilot_test@example.com';
    const password = 'Password123';
    const fullName = 'Copilot Test';
    let token = null;

    try {
        let res = await fetch(`${base}/api/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fullName, email, password }),
        });
        const data = await res.json();
        if (res.ok) {
            token = data.token;
            console.log('Registered', data.user._id);
        } else {
            console.log('Register failed', data.message);
        }
    } catch (e) {
        console.error('Register error', e);
    }

    if (!token) {
        try {
            const res = await fetch(`${base}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });
            const data = await res.json();
            if (res.ok) {
                token = data.token;
                console.log('Logged in', data.user._id);
            } else console.log('Login failed', data.message);
        } catch (e) {
            console.error('Login error', e);
        }
    }

    if (!token) {
        console.error('No token, abort');
        process.exit(1);
    }

    // me
    try {
        const meRes = await fetch(`${base}/api/auth/me`, { headers: { Authorization: `Bearer ${token}` } });
        console.log('me', await meRes.json());
    } catch (e) {
        console.error('me error', e);
    }

    // create topic
    try {
        const topicRes = await fetch(`${base}/api/topics`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ name: 'Test Topic', category: 'Technical', total_hours: 5 }),
        });
        console.log('create topic', topicRes.status, await topicRes.json());
    } catch (e) {
        console.error('create topic error', e);
    }

    // get topics
    try {
        const topics = await fetch(`${base}/api/topics`, { headers: { Authorization: `Bearer ${token}` } });
        console.log('topics list', await topics.json());
    } catch (e) {
        console.error('topics error', e);
    }

    // create problem
    try {
        const problemRes = await fetch(`${base}/api/problems`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ title: 'Two Sum', topic: 'Test Topic', difficulty: 'Easy', platform: 'LeetCode', status: 'Todo', attempts: 0, notes: '' }),
        });
        console.log('create problem', problemRes.status, await problemRes.json());
    } catch (e) {
        console.error('create problem error', e);
    }

    // get problems
    try {
        const problems = await fetch(`${base}/api/problems`, { headers: { Authorization: `Bearer ${token}` } });
        console.log('problems list', await problems.json());
    } catch (e) {
        console.error('problems error', e);
    }
})();