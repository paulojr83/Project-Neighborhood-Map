# Project Neighborhood Map
 The neighborhood map application is complex enough and incorporates a variety of data points that it can easily become unwieldy to manage. There are a number of frameworks, libraries and APIs available to make this process more manageable and many employers are looking for specific skills in using these packages.

#### The neighborhood Map
1. You need [Python](https://www.python.org/downloads/), than install [pip](https://pip.pypa.io/en/stable/installing/).
2. git clone https://github.com/paulojr83/Project-Neighborhood-Map.git neighrhood
3. cd neighrhood\app
4. python app.py

 Need some additional help getting started with the Neighborhood Map.
1. You need to set up Sqlalchemy for more information [see doc](http://docs.sqlalchemy.org/en/latest/core/schema.html)
1. Run the project: in your terminal > python project-folder/app/app.py access => than [http://localhost:5000/](http://localhost:5000/)
 * [Flask Templates](http://flask.pocoo.org/)  
 * [Deploying a Flask App with Heroku](https://www.youtube.com/watch?v=pmRT8QQLIqk)
 
#### App Architecture
Code is properly separated based upon Knockout's best practices.
Knockout is a bit of a shift in thinking. If you don't know where to start go through [Knockouts Documentation](http://knockoutjs.com/documentation/introduction.html), which reads like a series of articles. Follow along and build some of the basic examples from Knockout and try to apply them to your project.

Really think about the Model-View-ViewModel paradigm. Remember that Google Maps API handles the View and the Model you are mostly taking of the ViewModel component. You never really touch the HTML code that takes care of the View.


#### Dependency
* click
* db
* Flask
* google
* html5lib
* httplib2
* itsdangerous
* Jinja2
* MarkupSafe
* requests
* SQLAlchemy
* webapp2


#### First view of app
![alt text](https://raw.githubusercontent.com/paulojr83/Project-Neighborhood-Map/master/app/static/images/1.PNG "")

![alt text](https://raw.githubusercontent.com/paulojr83/Project-Neighborhood-Map/master/app/static/images/2.PNG "")

![alt text](https://raw.githubusercontent.com/paulojr83/Project-Neighborhood-Map/master/app/static/images/3.PNG "")
#### Mobile sizer
![alt text](https://raw.githubusercontent.com/paulojr83/Project-Neighborhood-Map/master/app/static/images/4.PNG "")

![alt text](https://raw.githubusercontent.com/paulojr83/Project-Neighborhood-Map/master/app/static/images/5.PNG "")

