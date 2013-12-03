module.exports = function(grunt) {
    // 配置
    grunt.initConfig({
        pkg : grunt.file.readJSON('package.json'),
        coffee: {
            main: {
                src: 'static/js/dev/marathon.coffee',
                dest: 'static/js/marathon.js'
            },
            yeah: {
                src: 'static/js/dev/yeah.coffee',
                dest: 'static/js/yeah.js'
            }
        },
        less: {
            watch: {
                src: ['static/css/dev/base.less', 'static/css/dev/marathon.less'],
            },
            main: {
                src: 'static/css/dev/marathon.less',
                dest: 'static/css/min.marathon.css'
            }
        },
        uglify: {
            main : {
                src : 'static/js/marathon.js',
                dest : 'static/js/min.marathon.js'
            },
            cookie : {
                src : 'static/js/lib/cookie.js',
                dest : 'static/js/lib/min.cookie.js'
            },
            url : {
                src : 'static/js/lib/url.js',
                dest : 'static/js/lib/min.url.js'
            },
            swipe : {
                src : 'static/js/lib/swipe.js',
                dest : 'static/js/lib/min.swipe.js'
            },
            pv : {
                src : 'static/js/dev/pv.js',
                dest : 'static/js/min.pv.js'
            },
            storage : {
                src : 'static/js/lib/storage.js',
                dest : 'static/js/lib/min.storage.js'
            },
            trace : {
                src : 'static/js/dev/trace.click.js',
                dest : 'static/js/min.trace.click.js'
            }
        },
        concat: {
            main : {
                src: [
                    'static/js/lib/min.zepto.js',
                    'static/js/lib/min.cookie.js',
                    'static/js/lib/min.storage.js',
                    'static/js/lib/min.url.js',
                    'static/js/lib/min.swipe.js',
                    'static/js/dev/trace.click.js',
                    'static/js/marathon.js'
                ],
                dest: 'static/js/min.marathon.js'
            },
            release: {
                src: [
                    'static/js/lib/min.zepto.js',
                    'static/js/lib/min.cookie.js',
                    'static/js/lib/min.storage.js',
                    'static/js/lib/min.url.js',
                    'static/js/lib/min.swipe.js',
                    'static/js/min.trace.click.js',
                    'static/js/min.pv.js',
                    'static/js/min.marathon.js'
                ],
                watch: [
                    'static/js/lib/min.swipe.js'
                ],
                dest: 'static/js/min.marathon.js'
            }
        },
        cssmin: {
            main: {
                src: 'static/css/min.marathon.css',
                dest: 'static/css/min.marathon.css'
            }
        },
        imagemin: {
            dynamic: {                         
              files: [{
                expand: true,                  
                cwd: 'static/img/',                   
                src: ['*.{png,jpg,gif}'],   
                dest: 'static/img/min/'
              }]
            }
        },
        watch: {
            files: [
                '<%= less.watch.src %>',
                '<%= coffee.main.src %>',
                '<%= coffee.yeah.src %>'
            ],
            tasks: ['less:main', 'coffee:main','coffee:yeah', 'concat:main']
        }
    });
    
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-imagemin');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-coffee');
    
    grunt.registerTask('default', ['coffee:main', 'less:main', 'uglify:main', 'concat:release', 'cssmin:main']);
    grunt.registerTask('css', ['less:main', 'cssmin:main']);
    grunt.registerTask('img', ['imagemin:dynamic']);
    grunt.registerTask('js', ['coffee:main',  'uglify:main', 'concat:release']);

}; 