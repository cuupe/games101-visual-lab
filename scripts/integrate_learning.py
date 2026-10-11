from pathlib import Path
root=Path(__file__).resolve().parents[1]
p=root/'src'/'main.jsx'
t=p.read_text(encoding='utf-8')
t=t.replace("import './style.css';", "import './style.css';\nimport './learning.css';\nimport {course} from './course';\nimport {CourseReader} from './CourseReader';\nimport {QuizBank} from './QuizBank';\nimport {GuidedExperiments} from './GuidedExperiments';")
t=t.replace("const tabs=[['lab','交互实验'],['theory','原理与公式'],['quiz','理解自测']];", "const tabs=[['theory','课程讲解'],['lab','引导实验'],['quiz','理解自测']];")
t=t.replace("?Number(m[1]):3,tab:m?.[2]??'lab'", "?Number(m[1]):1,tab:m?.[2]??(m?'lab':'theory')")
t=t.replace("lesson=lessons[route.id-1];", "lesson=lessons[route.id-1],unit=course[route.id];")
t=t.replace("const navigate=(id,tab='lab')", "const navigate=(id,tab='theory')")
t=t.replace("...l.sections.map(x=>x.join(' '))", "...course[l.id].sections.map(x=>x.title+' '+x.paragraphs.join(' ')),course[l.id].title")
t=t.replace('href="#lesson/1"','href="#lesson/1/theory"')
t=t.replace('href={`#lesson/${l.id}`}','href={`#lesson/${l.id}/theory`}')
t=t.replace('<span>{l.title}</span>', '<span>{course[l.id].title}</span>')
t=t.replace('<h1>{lesson.heading}</h1>','<span className="eyebrow">GAMES101 · LECTURE {String(lesson.id).padStart(2,\'0\')}</span><h1>{unit.title}</h1>')
t=t.replace("{key==='theory'&&<span>{lesson.formulas.length}</span>}","{key==='theory'&&<span>{unit.sections.length}</span>}{key==='quiz'&&<span>{unit.quiz.length}</span>}")
start=t.index(" {route.tab==='theory'&&")
end=t.index(' <footer className="lesson-footer">',start)
t=t[:start]+''' {route.tab==='theory'&&<div role="tabpanel" id="panel-theory" aria-labelledby="tab-theory"><CourseReader key={lesson.id} lesson={lesson} unit={unit} onLab={()=>navigate(lesson.id,'lab')} onQuiz={()=>navigate(lesson.id,'quiz')}/></div>}
 {route.tab==='quiz'&&<div role="tabpanel" id="panel-quiz" aria-labelledby="tab-quiz"><QuizBank key={lesson.id} lesson={lesson} unit={unit} onLab={()=>navigate(lesson.id,'lab')} onTheory={index=>{navigate(lesson.id,'theory');setTimeout(()=>document.getElementById(`reading-${lesson.id}-${index}`)?.scrollIntoView({behavior:'smooth'}),100);}}/></div>}
'''+t[end:]
needle='<section className="insight-band">'
t=t.replace(needle,'''<GuidedExperiments key={lesson.id} unit={unit} onApply={preset=>{setParams({...initialParams(lesson),...preset});setParamLesson(lesson.id);setPlaying(lesson.id===16);setResetToken(x=>x+1);document.querySelector('.viewport-panel')?.scrollIntoView({behavior:'smooth',block:'start'});}}/>'''+needle)
# Completion remains an explicit learner action, not a one-question reward.
t=t.replace("const submitQuiz=()=>{setChecked(true);if(answer===lesson.quiz.answer)setCompleted(old=>old.includes(lesson.id)?old:[...old,lesson.id]);};",'')
p.write_text(t,encoding='utf-8')
