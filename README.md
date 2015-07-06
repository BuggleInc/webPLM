WebPLM
==============

This project's goal is to move [PLM](https://github.com/oster/PLM) from a fat client to a web application using [Play Framework](https://www.playframework.com/) as the back-end and [AngularJS](https://angularjs.org/) to provide the front-end.

Getting Started
---------------

First, [install Play Framework](https://www.playframework.com/documentation/2.3.x/Installing).
Also a MongoDB instance have to be running if you want to use the user account features. [Check this page](http://docs.mongodb.org/manual/installation/) if you need to install it.

Then clone the repository:
```
git clone https://github.com/MatthieuNICOLAS/webPLM.git
```

You may now run the application in production mode using the following commands:
```
cd path/to/webPLM
activator start
```

If you prefer to run it in debug mode (where it reloads everything
automatically when files change), use ```activator ~run``` instead. If
you want to start it on port 8080 instead of 9000 by default, use
```activator "~run 8080"```

To access to your application, browse to <http://localhost:9000>


License
-------

Copyright 2015 INRIA

WebPLM is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

WebPLM is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with WebPLM.  If not, see <http://www.gnu.org/licenses/>.