<?php

namespace App\Http\Controllers;

use App\Models\EventoAgenda;
use App\Http\Resources\EventoAgendaResource;
use App\Services\LogService;
use Illuminate\Http\Request;

/**
 * Controlador de eventos da agenda oficial.
 */
class EventoController extends Controller
{

    /**
     * Lista os eventos ordenados por data (publico).
     */
    public function index()
    {
        LogService::info('1 - listando eventos da agenda');

        $eventos = EventoAgenda::orderBy('data_hora')->get();

        LogService::info('2 - eventos carregados', ['total' => $eventos->count()]);

        return EventoAgendaResource::collection($eventos);
    }

    /**
     * Cria um novo evento (admin).
     */
    public function criar(Request $request)
    {
        LogService::info('1 - salvando evento');

        $dados = $request->validate([
            'titulo'    => ['required', 'string', 'max:255'],
            'descricao' => ['required', 'string'],
            'local'     => ['required', 'string', 'max:255'],
            'data_hora' => ['required', 'date'],
            'imagem'    => ['nullable', 'string'],
        ]);

        $evento = EventoAgenda::create($dados);

        LogService::info('2 - evento criado', ['evento_id' => $evento->id]);

        return (new EventoAgendaResource($evento))->response()->setStatusCode(201);
    }

    /**
     * Atualiza um evento (admin).
     */
    public function atualizar(Request $request, EventoAgenda $evento)
    {
        LogService::info('1 - atualizando evento', ['evento_id' => $evento->id]);

        $dados = $request->validate([
            'titulo'    => ['sometimes', 'string', 'max:255'],
            'descricao' => ['sometimes', 'string'],
            'local'     => ['sometimes', 'string', 'max:255'],
            'data_hora' => ['sometimes', 'date'],
            'imagem'    => ['sometimes', 'nullable', 'string'],
        ]);

        $evento->update($dados);

        LogService::info('2 - evento atualizado', ['evento_id' => $evento->id]);

        return new EventoAgendaResource($evento);
    }

    /**
     * Remove um evento (admin).
     */
    public function excluir(EventoAgenda $evento)
    {
        LogService::info('1 - excluindo evento', ['evento_id' => $evento->id]);

        $evento->delete();

        LogService::info('2 - evento excluido', ['evento_id' => $evento->id]);

        return response()->json(['success' => true]);
    }
}
